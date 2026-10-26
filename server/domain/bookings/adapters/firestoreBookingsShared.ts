import type { Transaction } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import { BookingPersistenceMapper, SlotPersistenceMapper } from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { AvailabilitySlot, Booking, BookingStatus } from '../types/bookingTypes';

export const OFFERS = 'bookableOffers';
export const PUBLIC_OFFERS = 'publicBookableOffers';
export const SLOTS = 'availabilitySlots';
export const BOOKINGS = 'bookings';
export const PARTICIPANTS = 'bookingParticipants';
export const AUDIT = 'bookingAuditLogs';

export function nowIso(): string {
  return new Date().toISOString();
}

export function writeAudit(
  tx: Transaction,
  entry: {
    bookingId: string;
    from: BookingStatus | null;
    to: BookingStatus | null;
    actorUid: string;
    reason: string;
  }
): void {
  tx.set(adminDb.collection(AUDIT).doc(), { ...entry, at: nowIso() });
}

export function available(slot: AvailabilitySlot): number {
  return slot.capacityTotal - slot.capacityReserved - slot.capacitySold;
}

export async function readBooking(tx: Transaction, bookingId: string): Promise<Booking> {
  const snapshot = await tx.get(adminDb.collection(BOOKINGS).doc(bookingId));
  if (!snapshot.exists) {
    throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
  }
  return BookingPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
}

export async function readSlot(tx: Transaction, slotId: string): Promise<AvailabilitySlot> {
  const snapshot = await tx.get(adminDb.collection(SLOTS).doc(slotId));
  if (!snapshot.exists) {
    throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
  }
  return SlotPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {});
}
