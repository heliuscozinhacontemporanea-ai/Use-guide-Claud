import { BookingDomainError } from '../errors/bookingDomainError';
import type { BookingsPort, PageRequest } from '../ports/bookingsPort';
import {
  type AvailabilitySlot,
  type AvailabilitySlotStatus,
  type BookableOffer,
  type Booking,
  type BookingCancellation,
  type BookingCheckIn,
  type BookingParticipant,
  type BookingStatus,
  canTransitionBooking,
  type Page,
  type PublicBookableOffer,
} from '../types/bookingTypes';

/** Usado SOMENTE por testes (AGENTS.md §2.2 item 7): mesmas regras de vagas do adapter do Firestore. */
export class InMemoryBookingsAdapter implements BookingsPort {
  readonly offers = new Map<string, BookableOffer>();
  readonly publicOffers = new Map<string, PublicBookableOffer>();
  readonly slots = new Map<string, AvailabilitySlot>();
  readonly bookings = new Map<string, Booking>();
  readonly participants = new Map<string, BookingParticipant[]>();
  readonly audit: Array<{ bookingId: string; reason: string }> = [];

  async createOffer(offer: BookableOffer) {
    this.offers.set(offer.id, offer);
  }
  async saveOffer(offer: BookableOffer) {
    this.offers.set(offer.id, offer);
  }
  async getOffer(offerId: string) {
    return this.offers.get(offerId) ?? null;
  }
  async listOffersByOwner(ownerId: string) {
    return [...this.offers.values()].filter((offer) => offer.ownerId === ownerId);
  }
  async listPublishedOffersByGuideItem(guideItemId: string) {
    return [...this.offers.values()].filter(
      (offer) => offer.guideItemId === guideItemId && offer.status === 'published'
    );
  }
  async upsertPublicOfferProjection(offer: PublicBookableOffer) {
    this.publicOffers.set(offer.id, offer);
  }
  async deletePublicOfferProjection(offerId: string) {
    this.publicOffers.delete(offerId);
  }
  async createSlots(slots: AvailabilitySlot[]) {
    const created = slots.filter((slot) => !this.slots.has(slot.id));
    for (const slot of created) this.slots.set(slot.id, { ...slot });
    return created;
  }
  async getSlot(slotId: string) {
    return this.slots.get(slotId) ?? null;
  }
  async listSlots(offerId: string, fromIso: string, toIso: string) {
    return [...this.slots.values()]
      .filter(
        (slot) => slot.offerId === offerId && slot.startsAt >= fromIso && slot.startsAt <= toIso
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  async setSlotStatus(slotId: string, status: AvailabilitySlotStatus) {
    const slot = this.slots.get(slotId);
    if (slot) slot.status = status;
  }

  async rescheduleSlot(params: {
    slotId: string;
    startsAt: string;
    endsAt?: string;
    actorUid: string;
    reason: string;
  }): Promise<Booking[]> {
    const slot = this.slots.get(params.slotId);
    if (!slot) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    const at = new Date().toISOString();
    this.slots.set(slot.id, {
      ...slot,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      updatedAt: at,
    });
    const moved: Booking[] = [];
    for (const booking of this.bookings.values()) {
      if (booking.slotId !== slot.id) continue;
      if (booking.status !== 'confirmed' && booking.status !== 'pending_payment') continue;
      const updated: Booking = {
        ...booking,
        offerSnapshot: { ...booking.offerSnapshot, startsAt: params.startsAt },
        rescheduledAt: at,
        updatedAt: at,
      };
      this.bookings.set(booking.id, updated);
      moved.push(updated);
    }
    return moved;
  }

  private available(slot: AvailabilitySlot) {
    return slot.capacityTotal - slot.capacityReserved - slot.capacitySold;
  }

  async reserveCapacityAndCreateBooking(booking: Booking, participants: BookingParticipant[]) {
    const existing = this.bookings.get(booking.id);
    if (existing) return existing;
    const slot = this.slots.get(booking.slotId);
    if (!slot) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    if (slot.status !== 'open')
      throw new BookingDomainError('SLOT_UNAVAILABLE', 'Horário indisponível.');
    if (this.available(slot) < booking.participantsCount) {
      throw new BookingDomainError('INSUFFICIENT_CAPACITY', 'Vagas insuficientes.');
    }
    slot.capacityReserved += booking.participantsCount;
    this.bookings.set(booking.id, booking);
    this.participants.set(booking.id, participants);
    return booking;
  }

  async confirmBookingAndCommitCapacity(bookingId: string, paymentIntentId: string) {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    if (booking.status === 'confirmed') return booking;
    const slot = this.slots.get(booking.slotId);
    if (!slot) throw new BookingDomainError('NOT_FOUND', 'Horário não encontrado.');
    if (booking.status === 'pending_payment') {
      slot.capacityReserved -= booking.participantsCount;
      slot.capacitySold += booking.participantsCount;
    } else if (
      booking.status === 'expired' &&
      slot.status === 'open' &&
      this.available(slot) >= booking.participantsCount
    ) {
      slot.capacitySold += booking.participantsCount;
    } else {
      throw new BookingDomainError('LATE_PAYMENT_REJECTED', 'Pagamento não aceito.');
    }
    const confirmed: Booking = {
      ...booking,
      status: 'confirmed',
      expiresAt: null,
      paymentIntentId,
    };
    this.bookings.set(bookingId, confirmed);
    return confirmed;
  }

  async releaseCapacityAndSetStatus(params: {
    bookingId: string;
    to: 'expired' | 'canceled';
    actorUid: string;
    reason: string;
    cancellation?: BookingCancellation;
  }) {
    const booking = this.bookings.get(params.bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    if (booking.status === params.to) return booking;
    if (!canTransitionBooking(booking.status, params.to)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Mudança não permitida.');
    }
    const slot = this.slots.get(booking.slotId);
    if (slot) {
      if (booking.status === 'pending_payment') slot.capacityReserved -= booking.participantsCount;
      else slot.capacitySold -= booking.participantsCount;
    }
    const updated: Booking = {
      ...booking,
      status: params.to,
      expiresAt: null,
      ...(params.cancellation ? { cancellation: params.cancellation } : {}),
    };
    this.bookings.set(booking.id, updated);
    this.audit.push({ bookingId: booking.id, reason: params.reason });
    return updated;
  }

  async setBookingStatus(params: {
    bookingId: string;
    to: BookingStatus;
    actorUid: string;
    reason: string;
  }) {
    const booking = this.bookings.get(params.bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    if (booking.status === params.to) return booking;
    if (!canTransitionBooking(booking.status, params.to)) {
      throw new BookingDomainError('INVALID_TRANSITION', 'Mudança não permitida.');
    }
    const updated: Booking = { ...booking, status: params.to };
    this.bookings.set(booking.id, updated);
    this.audit.push({ bookingId: booking.id, reason: params.reason });
    return updated;
  }

  async recordBookingAudit(bookingId: string, _actorUid: string, reason: string) {
    this.audit.push({ bookingId, reason });
  }
  readonly checkInFailures: Array<{ slotId: string; actorUid: string; at: string }> = [];

  async recordCheckIn(bookingId: string, checkIn: BookingCheckIn) {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    if (booking.checkIn) return booking;
    if (booking.status !== 'confirmed' && booking.status !== 'completed') {
      throw new BookingDomainError('INVALID_TRANSITION', 'Esta reserva não aceita check-in.');
    }
    const updated: Booking = { ...booking, checkIn };
    this.bookings.set(bookingId, updated);
    this.audit.push({ bookingId, reason: 'checked_in' });
    return updated;
  }
  async updateBooking(
    bookingId: string,
    change: (current: Booking) => Booking | null,
    audit: { actorUid: string; reason: string }
  ) {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.');
    const updated = change(booking);
    if (!updated) return booking;
    this.bookings.set(bookingId, updated);
    this.audit.push({ bookingId, reason: audit.reason });
    return updated;
  }
  async listBookingsWithDeadlineBefore(nowIso: string, limit: number) {
    return [...this.bookings.values()]
      .filter((b) => b.deadline && b.deadline.at <= nowIso)
      .sort((a, b) => (a.deadline?.at ?? '').localeCompare(b.deadline?.at ?? ''))
      .slice(0, limit);
  }
  async listBookingsWithPickupAddressEraseBefore(nowIso: string, limit: number) {
    return [...this.bookings.values()]
      .filter((b) => b.pickupAddressEraseAt && b.pickupAddressEraseAt <= nowIso)
      .slice(0, limit);
  }
  async deleteParticipants(bookingId: string) {
    this.participants.delete(bookingId);
  }
  async countCheckInFailures(slotId: string, sinceIso: string, actorUid?: string) {
    return this.checkInFailures.filter(
      (f) => f.slotId === slotId && f.at >= sinceIso && (!actorUid || f.actorUid === actorUid)
    ).length;
  }
  async addCheckInFailure(slotId: string, actorUid: string, at: string) {
    this.checkInFailures.push({ slotId, actorUid, at });
  }

  async getBooking(bookingId: string) {
    return this.bookings.get(bookingId) ?? null;
  }
  async getParticipants(bookingId: string) {
    return this.participants.get(bookingId) ?? [];
  }

  private page(items: Booking[], page: PageRequest): Page<Booking> {
    const sorted = items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = page.cursor ? sorted.findIndex((item) => item.id === page.cursor) + 1 : 0;
    const data = sorted.slice(start, start + page.limit);
    return {
      data,
      nextCursor: start + page.limit < sorted.length ? (data.at(-1)?.id ?? null) : null,
    };
  }
  async listBookingsByBuyer(buyerId: string, page: PageRequest) {
    return this.page(
      [...this.bookings.values()].filter((b) => b.buyerId === buyerId),
      page
    );
  }
  async listBookingsByOffer(offerId: string, page: PageRequest) {
    return this.page(
      [...this.bookings.values()].filter((b) => b.offerId === offerId),
      page
    );
  }
  async listBookingsBySlot(slotId: string) {
    return [...this.bookings.values()].filter((b) => b.slotId === slotId);
  }
  async listExpiredPendingBookings(nowIso: string, limit: number) {
    return [...this.bookings.values()]
      .filter(
        (b) => b.status === 'pending_payment' && b.expiresAt !== null && b.expiresAt <= nowIso
      )
      .slice(0, limit);
  }
  async listConfirmedBookingsStartedBefore(nowIso: string, limit: number) {
    return [...this.bookings.values()]
      .filter((b) => b.status === 'confirmed' && b.offerSnapshot.startsAt <= nowIso)
      .slice(0, limit);
  }
}
