import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper, SlotPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { AvailabilitySlot, AvailabilitySlotStatus, Booking } from '../types/bookingTypes';
import { BOOKINGS, nowIso, SLOTS, writeAudit } from './firestoreBookingsShared';

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
}
