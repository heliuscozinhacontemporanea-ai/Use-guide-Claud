import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { Booking, BookingCheckIn } from '../types/bookingTypes';
import {
  BOOKINGS,
  CHECK_IN_FAILURES,
  nowIso,
  PARTICIPANTS,
  readBooking,
  writeAudit,
} from './firestoreBookingsShared';

/** Check-in, prazos e demais registros da prova do serviço nas reservas (D20). */
export class FirestoreCheckInStore {
  async recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, bookingId);
      if (booking.checkIn) return booking;
      if (booking.status !== 'confirmed' && booking.status !== 'completed') {
        throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita check-in.');
      }
      const updated: Booking = { ...booking, checkIn, updatedAt: nowIso() };
      tx.set(
        adminDb.collection(BOOKINGS).doc(bookingId),
        BookingPersistenceMapper.toPersistence(updated)
      );
      writeAudit(tx, {
        bookingId,
        from: booking.status,
        to: booking.status,
        actorUid: checkIn.byUid,
        reason: 'checked_in',
      });
      return updated;
    });
  }

  async countCheckInFailures(slotId: string, sinceIso: string, actorUid?: string): Promise<number> {
    let query = adminDb.collection(CHECK_IN_FAILURES).where('slotId', '==', slotId);
    if (actorUid) query = query.where('actorUid', '==', actorUid);
    const snapshot = await query.where('at', '>=', sinceIso).count().get();
    return snapshot.data().count;
  }

  async addCheckInFailure(slotId: string, actorUid: string, atIso: string): Promise<void> {
    // Só o horário, quem digitou e quando: nunca o código digitado (AGENTS.md §10.3).
    await adminDb.collection(CHECK_IN_FAILURES).add({ slotId, actorUid, at: atIso });
  }

  async updateBooking(
    bookingId: string,
    change: (current: Booking) => Booking | null,
    audit: { actorUid: string; reason: string }
  ): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, bookingId);
      const updated = change(booking);
      if (!updated) return booking;
      const saved: Booking = { ...updated, updatedAt: nowIso() };
      tx.set(
        adminDb.collection(BOOKINGS).doc(bookingId),
        BookingPersistenceMapper.toPersistence(saved)
      );
      writeAudit(tx, {
        bookingId,
        from: booking.status,
        to: saved.status,
        actorUid: audit.actorUid,
        reason: audit.reason,
      });
      return saved;
    });
  }

  async listBookingsWithDeadlineBefore(nowIsoValue: string, limit: number): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('deadline.at', '<=', nowIsoValue)
      .orderBy('deadline.at', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async listBookingsWithPickupAddressEraseBefore(
    nowIsoValue: string,
    limit: number
  ): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('pickupAddressEraseAt', '<=', nowIsoValue)
      .orderBy('pickupAddressEraseAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async deleteParticipants(bookingId: string): Promise<void> {
    const snapshot = await adminDb
      .collection(PARTICIPANTS)
      .where('bookingId', '==', bookingId)
      .limit(60)
      .get();
    if (snapshot.empty) return;
    const batch = adminDb.batch();
    for (const doc of snapshot.docs) batch.delete(doc.ref);
    await batch.commit();
  }
}
