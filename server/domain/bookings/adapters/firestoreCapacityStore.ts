import { randomUUID } from 'node:crypto';
import type { Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper, SlotPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import {
  type AvailabilitySlot,
  type Booking,
  type BookingCancellation,
  type BookingParticipant,
  canTransitionBooking,
} from '../types/bookingTypes';
import {
  canHoldAgain,
  fleetServiceEndsAt,
  holdFleetBooking,
  releaseFleetBooking,
} from '../utils/fleetLedger';
import { fleetSlotKey } from '../utils/fleetTime';
import {
  available,
  BOOKINGS,
  nowIso,
  PARTICIPANTS,
  readBooking,
  readSlot,
  SLOTS,
  writeAudit,
} from './firestoreBookingsShared';
import { readFleetDay, writeFleetDay } from './firestoreFleetStore';

async function readSlotOrNull(
  tx: Transaction,
  slotId: string | undefined
): Promise<AvailabilitySlot | null> {
  if (!slotId) return null;
  const snapshot = await tx.get(adminDb.collection(SLOTS).doc(slotId));
  return snapshot.exists
    ? SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
    : null;
}

/** Vagas dos horários e veículos dos dias: reservar, confirmar e devolver, sempre em transação. */
export class FirestoreCapacityStore {
  async reserveCapacityAndCreateBooking(
    booking: Booking,
    participants: BookingParticipant[]
  ): Promise<Booking> {
    const bookingRef = adminDb.collection(BOOKINGS).doc(booking.id);
    return adminDb.runTransaction(async (tx) => {
      const existingSnapshot = await tx.get(bookingRef);
      if (existingSnapshot.exists) {
        return BookingPersistenceMapper.toDomain(
          existingSnapshot.id,
          existingSnapshot.data() ?? {}
        );
      }
      const created = booking.fleet
        ? await this.holdFleet(tx, booking)
        : await this.holdSlot(tx, booking);
      tx.set(bookingRef, BookingPersistenceMapper.toPersistence(created));
      participants.forEach((participant, index) => {
        tx.set(adminDb.collection(PARTICIPANTS).doc(`${created.id}_${index}`), {
          bookingId: created.id,
          name: participant.name,
          isLeadContact: participant.isLeadContact,
        });
      });
      writeAudit(tx, {
        bookingId: created.id,
        from: null,
        to: created.status,
        actorUid: created.buyerId,
        reason: 'created',
      });
      return created;
    });
  }

  private async holdSlot(tx: Transaction, booking: Booking): Promise<Booking> {
    const slot = await readSlotOrNull(tx, booking.slotId);
    if (!slot) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    if (slot.status !== 'open' || new Date(slot.startsAt).getTime() <= Date.now()) {
      throw new BookingDomainError('SLOT_UNAVAILABLE', 'Horário indisponível.');
    }
    if (available(slot) < booking.participantsCount) {
      throw new BookingDomainError(
        'INSUFFICIENT_CAPACITY',
        'Vagas insuficientes para este horário.'
      );
    }
    tx.update(adminDb.collection(SLOTS).doc(slot.id), {
      capacityReserved: slot.capacityReserved + booking.participantsCount,
      updatedAt: nowIso(),
    });
    return booking;
  }

  // Reserva por veículo (F3b): ocupa o dia e usa o horário de serviço do mesmo início e fim, ou cria um.
  private async holdFleet(tx: Transaction, booking: Booking): Promise<Booking> {
    const dayId = booking.fleet?.dayId ?? '';
    const day = await readFleetDay(tx, dayId);
    const key = fleetSlotKey(booking.offerSnapshot.startsAt, fleetServiceEndsAt(booking));
    const existingSlot = await readSlotOrNull(tx, day?.slotIndex[key]);
    const result = holdFleetBooking({
      day,
      booking,
      existingSlot,
      newSlotId: `slot_${randomUUID()}`,
      now: nowIso(),
    });
    tx.set(
      adminDb.collection(SLOTS).doc(result.slot.id),
      SlotPersistenceMapper.toPersistence(result.slot)
    );
    writeFleetDay(tx, result.day);
    return { ...booking, slotId: result.slot.id };
  }

  async confirmBookingAndCommitCapacity(
    bookingId: string,
    paymentIntentId: string
  ): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, bookingId);
      if (booking.status === 'confirmed') return booking;
      const slot = await readSlot(tx, booking.slotId);
      const day = booking.fleet ? await readFleetDay(tx, booking.fleet.dayId) : null;
      const slotRef = adminDb.collection(SLOTS).doc(slot.id);
      const units = booking.participantsCount;

      if (booking.status === 'pending_payment') {
        tx.update(slotRef, {
          capacityReserved: Math.max(0, slot.capacityReserved - units),
          capacitySold: slot.capacitySold + units,
          updatedAt: nowIso(),
        });
      } else if (
        booking.status === 'expired' &&
        slot.status === 'open' &&
        this.fitsAgain(slot, day, booking)
      ) {
        // Pagamento chegou depois da expiração e ainda há vaga (ou veículo): a reserva volta a valer.
        tx.update(slotRef, { capacitySold: slot.capacitySold + units, updatedAt: nowIso() });
        if (day && booking.fleet) {
          writeFleetDay(tx, {
            ...day,
            holds: [
              ...day.holds,
              { bookingId, startsAt: booking.fleet.startsAt, endsAt: booking.fleet.endsAt, units },
            ],
            updatedAt: nowIso(),
          });
        }
      } else {
        throw new BookingDomainError(
          'LATE_PAYMENT_REJECTED',
          'Pagamento recebido para uma reserva que não pode mais ser confirmada.'
        );
      }

      const confirmed: Booking = {
        ...booking,
        status: 'confirmed',
        expiresAt: null,
        paymentIntentId,
        updatedAt: nowIso(),
      };
      tx.set(
        adminDb.collection(BOOKINGS).doc(bookingId),
        BookingPersistenceMapper.toPersistence(confirmed)
      );
      writeAudit(tx, {
        bookingId,
        from: booking.status,
        to: 'confirmed',
        actorUid: 'system:webhook',
        reason: 'payment_succeeded',
      });
      return confirmed;
    });
  }

  private fitsAgain(
    slot: AvailabilitySlot,
    day: Parameters<typeof canHoldAgain>[0],
    booking: Booking
  ): boolean {
    return booking.fleet
      ? canHoldAgain(day, booking)
      : available(slot) >= booking.participantsCount;
  }

  async releaseCapacityAndSetStatus(params: {
    bookingId: string;
    to: 'expired' | 'canceled';
    actorUid: string;
    reason: string;
    cancellation?: BookingCancellation;
  }): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, params.bookingId);
      if (booking.status === params.to) return booking;
      if (!canTransitionBooking(booking.status, params.to)) {
        throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
      }
      const slot = await readSlot(tx, booking.slotId);
      const day = booking.fleet ? await readFleetDay(tx, booking.fleet.dayId) : null;
      const field = booking.status === 'pending_payment' ? 'capacityReserved' : 'capacitySold';
      tx.update(adminDb.collection(SLOTS).doc(slot.id), {
        [field]: Math.max(0, slot[field] - booking.participantsCount),
        updatedAt: nowIso(),
      });
      if (day) writeFleetDay(tx, releaseFleetBooking(day, booking.id, nowIso()));
      const updated: Booking = {
        ...booking,
        status: params.to,
        expiresAt: null,
        ...(params.cancellation ? { cancellation: params.cancellation } : {}),
        updatedAt: nowIso(),
      };
      tx.set(
        adminDb.collection(BOOKINGS).doc(booking.id),
        BookingPersistenceMapper.toPersistence(updated)
      );
      writeAudit(tx, {
        bookingId: booking.id,
        from: booking.status,
        to: params.to,
        actorUid: params.actorUid,
        reason: params.reason,
      });
      return updated;
    });
  }
}
