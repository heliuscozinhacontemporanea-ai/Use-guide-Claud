import type { Query } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  BookingPersistenceMapper,
  OfferPersistenceMapper,
  ParticipantPersistenceMapper,
  SlotPersistenceMapper,
} from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import {
  type BookableOffer,
  type Booking,
  type BookingCancellation,
  type BookingParticipant,
  type BookingStatus,
  canTransitionBooking,
  type Page,
  type PublicBookableOffer,
} from '../types/bookingTypes';
import {
  AUDIT,
  available,
  BOOKINGS,
  nowIso,
  OFFERS,
  PARTICIPANTS,
  PUBLIC_OFFERS,
  readBooking,
  readSlot,
  SLOTS,
  writeAudit,
} from './firestoreBookingsShared';
import { FirestoreCheckInStore } from './firestoreCheckInStore';
import { FirestoreSlotStore } from './firestoreSlotStore';

async function paginate(query: Query, page: PageRequest): Promise<Page<Booking>> {
  let paged = query.limit(page.limit + 1);
  if (page.cursor) {
    const cursorSnapshot = await adminDb.collection(BOOKINGS).doc(page.cursor).get();
    if (cursorSnapshot.exists) paged = paged.startAfter(cursorSnapshot);
  }
  const snapshot = await paged.get();
  const docs = snapshot.docs.slice(0, page.limit);
  return {
    data: docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data())),
    nextCursor: snapshot.docs.length > page.limit ? (docs.at(-1)?.id ?? null) : null,
  };
}

export class FirestoreBookingsAdapter implements BookingsPort {
  private readonly slots = new FirestoreSlotStore();
  private readonly checkIns = new FirestoreCheckInStore();

  async createOffer(offer: BookableOffer): Promise<void> {
    await adminDb
      .collection(OFFERS)
      .doc(offer.id)
      .create(OfferPersistenceMapper.toPersistence(offer));
  }

  async saveOffer(offer: BookableOffer): Promise<void> {
    await adminDb.collection(OFFERS).doc(offer.id).set(OfferPersistenceMapper.toPersistence(offer));
  }

  async getOffer(offerId: string): Promise<BookableOffer | null> {
    const snapshot = await adminDb.collection(OFFERS).doc(offerId).get();
    return snapshot.exists
      ? OfferPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
      : null;
  }

  async listOffersByOwner(ownerId: string): Promise<BookableOffer[]> {
    const snapshot = await adminDb
      .collection(OFFERS)
      .where('ownerId', '==', ownerId)
      .limit(200)
      .get();
    return snapshot.docs.map((doc) => OfferPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async listPublishedOffersByGuideItem(guideItemId: string): Promise<BookableOffer[]> {
    const snapshot = await adminDb
      .collection(OFFERS)
      .where('guideItemId', '==', guideItemId)
      .where('status', '==', 'published')
      .limit(20)
      .get();
    return snapshot.docs.map((doc) => OfferPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async upsertPublicOfferProjection(offer: PublicBookableOffer): Promise<void> {
    const { id, ...data } = offer;
    await adminDb
      .collection(PUBLIC_OFFERS)
      .doc(id)
      .set(JSON.parse(JSON.stringify(data)));
  }

  async deletePublicOfferProjection(offerId: string): Promise<void> {
    await adminDb.collection(PUBLIC_OFFERS).doc(offerId).delete();
  }

  readonly createSlots = this.slots.createSlots.bind(this.slots);
  readonly getSlot = this.slots.getSlot.bind(this.slots);
  readonly listSlots = this.slots.listSlots.bind(this.slots);
  readonly setSlotStatus = this.slots.setSlotStatus.bind(this.slots);
  readonly rescheduleSlot = this.slots.rescheduleSlot.bind(this.slots);

  readonly recordCheckIn = this.checkIns.recordCheckIn.bind(this.checkIns);
  readonly countCheckInFailures = this.checkIns.countCheckInFailures.bind(this.checkIns);
  readonly addCheckInFailure = this.checkIns.addCheckInFailure.bind(this.checkIns);

  async reserveCapacityAndCreateBooking(
    booking: Booking,
    participants: BookingParticipant[]
  ): Promise<Booking> {
    const slotRef = adminDb.collection(SLOTS).doc(booking.slotId);
    const bookingRef = adminDb.collection(BOOKINGS).doc(booking.id);
    return adminDb.runTransaction(async (tx) => {
      const [slotSnapshot, existingSnapshot] = await Promise.all([
        tx.get(slotRef),
        tx.get(bookingRef),
      ]);
      if (existingSnapshot.exists) {
        return BookingPersistenceMapper.toDomain(
          existingSnapshot.id,
          existingSnapshot.data() ?? {}
        );
      }
      if (!slotSnapshot.exists) {
        throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
      }
      const slot = SlotPersistenceMapper.toDomain(slotSnapshot.id, slotSnapshot.data() ?? {});
      if (slot.status !== 'open' || new Date(slot.startsAt).getTime() <= Date.now()) {
        throw new BookingDomainError('SLOT_UNAVAILABLE', 'Horário indisponível.');
      }
      if (available(slot) < booking.participantsCount) {
        throw new BookingDomainError(
          'INSUFFICIENT_CAPACITY',
          'Vagas insuficientes para este horário.'
        );
      }
      tx.update(slotRef, {
        capacityReserved: slot.capacityReserved + booking.participantsCount,
        updatedAt: nowIso(),
      });
      tx.set(bookingRef, BookingPersistenceMapper.toPersistence(booking));
      participants.forEach((participant, index) => {
        tx.set(adminDb.collection(PARTICIPANTS).doc(`${booking.id}_${index}`), {
          bookingId: booking.id,
          name: participant.name,
          isLeadContact: participant.isLeadContact,
        });
      });
      writeAudit(tx, {
        bookingId: booking.id,
        from: null,
        to: booking.status,
        actorUid: booking.buyerId,
        reason: 'created',
      });
      return booking;
    });
  }

  async confirmBookingAndCommitCapacity(
    bookingId: string,
    paymentIntentId: string
  ): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, bookingId);
      if (booking.status === 'confirmed') {
        return booking;
      }
      const slot = await readSlot(tx, booking.slotId);
      const slotRef = adminDb.collection(SLOTS).doc(slot.id);

      if (booking.status === 'pending_payment') {
        tx.update(slotRef, {
          capacityReserved: Math.max(0, slot.capacityReserved - booking.participantsCount),
          capacitySold: slot.capacitySold + booking.participantsCount,
          updatedAt: nowIso(),
        });
      } else if (
        booking.status === 'expired' &&
        slot.status === 'open' &&
        available(slot) >= booking.participantsCount
      ) {
        // Pagamento chegou depois da expiração e ainda há vaga: a reserva volta a valer.
        tx.update(slotRef, {
          capacitySold: slot.capacitySold + booking.participantsCount,
          updatedAt: nowIso(),
        });
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

  async releaseCapacityAndSetStatus(params: {
    bookingId: string;
    to: 'expired' | 'canceled';
    actorUid: string;
    reason: string;
    cancellation?: BookingCancellation;
  }): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, params.bookingId);
      if (booking.status === params.to) {
        return booking;
      }
      if (!canTransitionBooking(booking.status, params.to)) {
        throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
      }
      const slot = await readSlot(tx, booking.slotId);
      const field = booking.status === 'pending_payment' ? 'capacityReserved' : 'capacitySold';
      tx.update(adminDb.collection(SLOTS).doc(slot.id), {
        [field]: Math.max(0, slot[field] - booking.participantsCount),
        updatedAt: nowIso(),
      });
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

  async setBookingStatus(params: {
    bookingId: string;
    to: BookingStatus;
    actorUid: string;
    reason: string;
  }): Promise<Booking> {
    return adminDb.runTransaction(async (tx) => {
      const booking = await readBooking(tx, params.bookingId);
      if (booking.status === params.to) {
        return booking;
      }
      if (!canTransitionBooking(booking.status, params.to)) {
        throw new BookingDomainError('INVALID_TRANSITION', 'Mudança de status não permitida.');
      }
      const updated: Booking = { ...booking, status: params.to, updatedAt: nowIso() };
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

  async recordBookingAudit(bookingId: string, actorUid: string, reason: string): Promise<void> {
    await adminDb
      .collection(AUDIT)
      .add({ bookingId, from: null, to: null, actorUid, reason, at: nowIso() });
  }

  async getBooking(bookingId: string): Promise<Booking | null> {
    const snapshot = await adminDb.collection(BOOKINGS).doc(bookingId).get();
    return snapshot.exists
      ? BookingPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {})
      : null;
  }

  async getParticipants(bookingId: string): Promise<BookingParticipant[]> {
    const snapshot = await adminDb
      .collection(PARTICIPANTS)
      .where('bookingId', '==', bookingId)
      .limit(60)
      .get();
    return snapshot.docs.map((doc) => ParticipantPersistenceMapper.toDomain(doc.data()));
  }

  async listBookingsByBuyer(buyerId: string, page: PageRequest): Promise<Page<Booking>> {
    return paginate(
      adminDb.collection(BOOKINGS).where('buyerId', '==', buyerId).orderBy('createdAt', 'desc'),
      page
    );
  }

  async listBookingsByOffer(offerId: string, page: PageRequest): Promise<Page<Booking>> {
    return paginate(
      adminDb.collection(BOOKINGS).where('offerId', '==', offerId).orderBy('createdAt', 'desc'),
      page
    );
  }

  async listBookingsBySlot(slotId: string): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('slotId', '==', slotId)
      .limit(500)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async listExpiredPendingBookings(nowIsoValue: string, limit: number): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('status', '==', 'pending_payment')
      .where('expiresAt', '<=', nowIsoValue)
      .orderBy('expiresAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async listConfirmedBookingsStartedBefore(nowIsoValue: string, limit: number): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('status', '==', 'confirmed')
      .where('offerSnapshot.startsAt', '<=', nowIsoValue)
      .orderBy('offerSnapshot.startsAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }
}
