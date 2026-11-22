import type { QueryDocumentSnapshot, Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper, SlotPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { AvailabilitySlot, AvailabilitySlotStatus, Booking } from '../types/bookingTypes';
import { fleetDayIdAt, rescheduleFleetHolds } from '../utils/fleetReschedule';
import { BOOKINGS, nowIso, OFFERS, SLOTS, writeAudit } from './firestoreBookingsShared';
import { readFleetDay, writeFleetDay } from './firestoreFleetStore';

/** Horários de uma oferta (`availabilitySlots`). */
export class FirestoreSlotStore {
  async createSlots(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]> {
    if (slots.length === 0) return [];
    const refs = slots.map((slot) => adminDb.collection(SLOTS).doc(slot.id));
    return adminDb.runTransaction(async (tx) => {
      const snapshots = await tx.getAll(...refs);
      // set() sobre um horário existente zeraria as vagas vendidas; por isso só criamos os que faltam.
      const created = slots.filter((_slot, index) => !snapshots[index]?.exists);
      for (const slot of created) {
        tx.create(
          adminDb.collection(SLOTS).doc(slot.id),
          SlotPersistenceMapper.toPersistence(slot)
        );
      }
      return created;
    });
  }

  async getSlot(slotId: string): Promise<AvailabilitySlot | null> {
    const snapshot = await adminDb.collection(SLOTS).doc(slotId).get();
    return snapshot.exists
      ? SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
      : null;
  }

  async listSlots(offerId: string, fromIso: string, toIso: string): Promise<AvailabilitySlot[]> {
    const snapshot = await adminDb
      .collection(SLOTS)
      .where('offerId', '==', offerId)
      .where('startsAt', '>=', fromIso)
      .where('startsAt', '<=', toIso)
      .orderBy('startsAt', 'asc')
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => SlotPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async setSlotStatus(slotId: string, status: AvailabilitySlotStatus): Promise<void> {
    await adminDb.collection(SLOTS).doc(slotId).update({ status, updatedAt: nowIso() });
  }

  async startSlot(slotId: string, startedAt: string, actorUid: string): Promise<AvailabilitySlot> {
    const ref = adminDb.collection(SLOTS).doc(slotId);
    return adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      if (!snapshot.exists) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
      const slot = SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
      if (slot.startedAt) return slot;
      const updatedAt = nowIso();
      tx.update(ref, { startedAt, startedByUid: actorUid, updatedAt });
      return { ...slot, startedAt, startedByUid: actorUid, updatedAt };
    });
  }

  async rescheduleSlot(params: {
    slotId: string;
    startsAt: string;
    endsAt?: string;
    actorUid: string;
    reason: string;
  }): Promise<Booking[]> {
    const slotRef = adminDb.collection(SLOTS).doc(params.slotId);
    return adminDb.runTransaction(async (tx) => {
      const slotSnapshot = await tx.get(slotRef);
      if (!slotSnapshot.exists) {
        throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
      }
      const bookingsSnapshot = await tx.get(
        adminDb.collection(BOOKINGS).where('slotId', '==', params.slotId).limit(500)
      );
      const at = nowIso();
      const slot = SlotPersistenceMapper.toDomain(slotSnapshot.id, slotSnapshot.data() ?? {});
      if (slot.fleetDayId) {
        return this.rescheduleFleet(tx, slot, bookingsSnapshot.docs, params, at);
      }
      tx.update(slotRef, {
        startsAt: params.startsAt,
        endsAt: params.endsAt ?? null,
        updatedAt: at,
      });
      const moved: Booking[] = [];
      for (const doc of bookingsSnapshot.docs) {
        const booking = BookingPersistenceMapper.toDomain(doc.id, doc.data());
        if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') continue;
        const updated: Booking = {
          ...booking,
          offerSnapshot: { ...booking.offerSnapshot, startsAt: params.startsAt },
          rescheduledAt: at,
          updatedAt: at,
        };
        tx.update(doc.ref, {
          'offerSnapshot.startsAt': params.startsAt,
          rescheduledAt: at,
          updatedAt: at,
        });
        writeAudit(tx, {
          bookingId: booking.id,
          from: booking.status,
          to: booking.status,
          actorUid: params.actorUid,
          reason: params.reason,
        });
        moved.push(updated);
      }
      return moved;
    });
  }

  // Horário por veículo (F3b): os veículos mudam de hora, e de dia se a data mudar, só se couberem.
  private async rescheduleFleet(
    tx: Transaction,
    slot: AvailabilitySlot,
    docs: QueryDocumentSnapshot[],
    params: { startsAt: string; actorUid: string; reason: string },
    at: string
  ): Promise<Booking[]> {
    const offerSnapshot = await tx.get(adminDb.collection(OFFERS).doc(slot.offerId));
    const timeZone = offerSnapshot.data()?.timeZone;
    const from = slot.fleetDayId ? await readFleetDay(tx, slot.fleetDayId) : null;
    const toId = fleetDayIdAt(
      slot.offerId,
      params.startsAt,
      typeof timeZone === 'string' ? timeZone : undefined
    );
    const to = from && toId === from.id ? from : await readFleetDay(tx, toId);
    const active = docs
      .map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()))
      .filter((booking) => booking.status === 'confirmed' || booking.status === 'pending_payment');
    const plan = rescheduleFleetHolds({
      slot,
      bookings: active,
      startsAt: params.startsAt,
      timeZone: typeof timeZone === 'string' ? timeZone : undefined,
      days: (id) => (id === from?.id ? from : id === to?.id ? to : null),
      now: at,
    });
    tx.set(adminDb.collection(SLOTS).doc(slot.id), SlotPersistenceMapper.toPersistence(plan.slot));
    for (const day of plan.days) writeFleetDay(tx, day);
    return plan.bookings.map((booking) => {
      const updated = { ...booking, rescheduledAt: at, updatedAt: at };
      tx.set(
        adminDb.collection(BOOKINGS).doc(booking.id),
        BookingPersistenceMapper.toPersistence(updated)
      );
      writeAudit(tx, {
        bookingId: booking.id,
        from: booking.status,
        to: booking.status,
        actorUid: params.actorUid,
        reason: params.reason,
      });
      return updated;
    });
  }
}
