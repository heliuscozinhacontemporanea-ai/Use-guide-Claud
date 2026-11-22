import type { Query } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import {
  BookingPersistenceMapper,
  OfferPersistenceMapper,
  ParticipantPersistenceMapper,
} from '../dtos/bookingPersistenceMappers';
import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import {
  type BookableOffer,
  type Booking,
  type BookingParticipant,
  type BookingStatus,
  canTransitionBooking,
  type Page,
  type PublicBookableOffer,
} from '../types/bookingTypes';
import {
  AUDIT,
  BOOKINGS,
  nowIso,
  OFFERS,
  PARTICIPANTS,
  PUBLIC_OFFERS,
  readBooking,
  writeAudit,
} from './firestoreBookingsShared';
import { FirestoreCapacityStore } from './firestoreCapacityStore';
import { FirestoreCheckInStore } from './firestoreCheckInStore';
import { FirestoreFleetStore } from './firestoreFleetStore';
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
  private readonly capacity = new FirestoreCapacityStore();
  private readonly fleet = new FirestoreFleetStore();

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

  async listOffersByGuideItem(guideItemId: string): Promise<BookableOffer[]> {
    const snapshot = await adminDb
      .collection(OFFERS)
      .where('guideItemId', '==', guideItemId)
      .limit(50)
      .get();
    return snapshot.docs.map((doc) => OfferPersistenceMapper.toDomain(doc.id, doc.data()));
  }

  async hasActiveBookings(offerId: string): Promise<boolean> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('offerId', '==', offerId)
      .where('status', 'in', ['pending_payment', 'confirmed'])
      .limit(1)
      .get();
    return !snapshot.empty;
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

  readonly saveFleetDays = this.fleet.saveFleetDays.bind(this.fleet);
  readonly getFleetDay = this.fleet.getFleetDay.bind(this.fleet);
  readonly listFleetDays = this.fleet.listFleetDays.bind(this.fleet);

  readonly reserveCapacityAndCreateBooking = this.capacity.reserveCapacityAndCreateBooking.bind(
    this.capacity
  );
  readonly confirmBookingAndCommitCapacity = this.capacity.confirmBookingAndCommitCapacity.bind(
    this.capacity
  );
  readonly releaseCapacityAndSetStatus = this.capacity.releaseCapacityAndSetStatus.bind(
    this.capacity
  );

  readonly createSlots = this.slots.createSlots.bind(this.slots);
  readonly getSlot = this.slots.getSlot.bind(this.slots);
  readonly listSlots = this.slots.listSlots.bind(this.slots);
  readonly setSlotStatus = this.slots.setSlotStatus.bind(this.slots);
  readonly rescheduleSlot = this.slots.rescheduleSlot.bind(this.slots);
  readonly startSlot = this.slots.startSlot.bind(this.slots);

  readonly recordCheckIns = this.checkIns.recordCheckIns.bind(this.checkIns);
  readonly setParticipant = this.checkIns.setParticipant.bind(this.checkIns);
  readonly countCheckInFailures = this.checkIns.countCheckInFailures.bind(this.checkIns);
  readonly addCheckInFailure = this.checkIns.addCheckInFailure.bind(this.checkIns);
  readonly updateBooking = this.checkIns.updateBooking.bind(this.checkIns);
  readonly listBookingsWithDeadlineBefore = this.checkIns.listBookingsWithDeadlineBefore.bind(
    this.checkIns
  );
  readonly listBookingsWithPersonalDataEraseBefore =
    this.checkIns.listBookingsWithPersonalDataEraseBefore.bind(this.checkIns);
  readonly deleteParticipants = this.checkIns.deleteParticipants.bind(this.checkIns);

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

  async getBookings(bookingIds: string[]): Promise<Booking[]> {
    const out: Booking[] = [];
    for (let i = 0; i < bookingIds.length; i += 100) {
      const refs = bookingIds.slice(i, i + 100).map((id) => adminDb.collection(BOOKINGS).doc(id));
      if (refs.length === 0) continue;
      for (const snapshot of await adminDb.getAll(...refs)) {
        if (snapshot.exists) {
          out.push(BookingPersistenceMapper.toDomain(snapshot.id, snapshot.data() ?? {}));
        }
      }
    }
    return out;
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

  async listConfirmedBookingsStartingBetween(
    fromIso: string,
    toIso: string,
    limit: number
  ): Promise<Booking[]> {
    const snapshot = await adminDb
      .collection(BOOKINGS)
      .where('status', '==', 'confirmed')
      .where('offerSnapshot.startsAt', '>=', fromIso)
      .where('offerSnapshot.startsAt', '<', toIso)
      .orderBy('offerSnapshot.startsAt', 'asc')
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => BookingPersistenceMapper.toDomain(doc.id, doc.data()));
  }
}
