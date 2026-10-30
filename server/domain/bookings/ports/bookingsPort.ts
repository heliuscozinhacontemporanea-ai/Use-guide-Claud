import type {
  AvailabilitySlot,
  AvailabilitySlotStatus,
  BookableOffer,
  Booking,
  BookingCancellation,
  BookingCheckIn,
  BookingParticipant,
  BookingStatus,
  Page,
  PublicBookableOffer,
} from '../types/bookingTypes';

export interface PageRequest {
  cursor?: string | null;
  limit: number;
}

/**
 * Persistência do domínio. Toda operação que mexe em vagas é transacional no adapter;
 * toda mudança de status valida `canTransitionBooking` e grava auditoria.
 */
export interface BookingsPort {
  createOffer(offer: BookableOffer): Promise<void>;
  saveOffer(offer: BookableOffer): Promise<void>;
  getOffer(offerId: string): Promise<BookableOffer | null>;
  listOffersByOwner(ownerId: string): Promise<BookableOffer[]>;
  listPublishedOffersByGuideItem(guideItemId: string): Promise<BookableOffer[]>;
  upsertPublicOfferProjection(offer: PublicBookableOffer): Promise<void>;
  deletePublicOfferProjection(offerId: string): Promise<void>;

  /** Cria só os horários cujo ID ainda não existe; devolve os criados. */
  createSlots(slots: AvailabilitySlot[]): Promise<AvailabilitySlot[]>;
  getSlot(slotId: string): Promise<AvailabilitySlot | null>;
  listSlots(offerId: string, fromIso: string, toIso: string): Promise<AvailabilitySlot[]>;
  setSlotStatus(slotId: string, status: AvailabilitySlotStatus): Promise<void>;
  /** Muda o horário e leva as reservas ativas junto, na mesma transação; devolve as reservas movidas. */
  rescheduleSlot(params: {
    slotId: string;
    startsAt: string;
    endsAt?: string;
    actorUid: string;
    reason: string;
  }): Promise<Booking[]>;

  /** Idempotente pelo ID da reserva; lança INSUFFICIENT_CAPACITY ou SLOT_UNAVAILABLE. */
  reserveCapacityAndCreateBooking(
    booking: Booking,
    participants: BookingParticipant[]
  ): Promise<Booking>;
  /** Idempotente: já confirmada devolve a atual. Pagamento que não pode ser aceito → LATE_PAYMENT_REJECTED. */
  confirmBookingAndCommitCapacity(bookingId: string, paymentIntentId: string): Promise<Booking>;
  /** Devolve as vagas (reservadas ou vendidas, conforme o status atual) e muda o status. */
  releaseCapacityAndSetStatus(params: {
    bookingId: string;
    to: 'expired' | 'canceled';
    actorUid: string;
    reason: string;
    cancellation?: BookingCancellation;
  }): Promise<Booking>;
  setBookingStatus(params: {
    bookingId: string;
    to: BookingStatus;
    actorUid: string;
    reason: string;
  }): Promise<Booking>;
  /** Só auditoria, sem mudar status (ex: pagamento recusado que ainda pode ser tentado de novo). */
  recordBookingAudit(bookingId: string, actorUid: string, reason: string): Promise<void>;

  /**
   * Grava o check-in numa transação: só reserva confirmada ou concluída e sem check-in; repetir
   * devolve a reserva com o check-in que já existe.
   */
  recordCheckIn(bookingId: string, checkIn: BookingCheckIn): Promise<Booking>;
  /** Códigos errados no horário desde `sinceIso`, contados no Firestore (o Cloud Run não guarda estado). */
  countCheckInFailures(slotId: string, sinceIso: string): Promise<number>;
  addCheckInFailure(slotId: string, actorUid: string, atIso: string): Promise<void>;

  getBooking(bookingId: string): Promise<Booking | null>;
  getParticipants(bookingId: string): Promise<BookingParticipant[]>;
  listBookingsByBuyer(buyerId: string, page: PageRequest): Promise<Page<Booking>>;
  listBookingsByOffer(offerId: string, page: PageRequest): Promise<Page<Booking>>;
  listBookingsBySlot(slotId: string): Promise<Booking[]>;
  listExpiredPendingBookings(nowIso: string, limit: number): Promise<Booking[]>;
  listConfirmedBookingsStartedBefore(nowIso: string, limit: number): Promise<Booking[]>;
}
