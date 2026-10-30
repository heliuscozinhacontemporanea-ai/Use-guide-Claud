import type {
  BookingDetails,
  BookingSummary,
  CancelBookingResponse,
  ArrivalLocation,
  CheckInCodeView,
  CodeCheckInPayload,
  EntryCheckInPayload,
  EntryPassView,
  UnitCheckInResult,
  NoCodeReason,
  CreateBookingPayload,
  CreateBookingResponse,
  CreateOfferPayload,
  CreateSlotsPayload,
  OfferFields,
  OfferStatus,
  Page,
  PartnerOffer,
  PartnerSlot,
  PublicSlot,
} from '../types/bookings';

export interface BookingsApiPort {
  listPartnerOffers(): Promise<PartnerOffer[]>;
  createOffer(payload: CreateOfferPayload): Promise<PartnerOffer>;
  updateOffer(offerId: string, payload: Partial<OfferFields>): Promise<PartnerOffer>;
  setOfferStatus(offerId: string, status: Exclude<OfferStatus, 'draft'>): Promise<PartnerOffer>;
  listPartnerSlots(offerId: string, fromIso: string, toIso: string): Promise<PartnerSlot[]>;
  createSlots(offerId: string, payload: CreateSlotsPayload): Promise<PartnerSlot[]>;
  cancelSlot(offerId: string, slotId: string): Promise<{ canceledBookings: number }>;
  rescheduleSlot(
    offerId: string,
    slotId: string,
    change: { startsAt: string; reason: string }
  ): Promise<{ rescheduledBookings: number }>;
  listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>>;
  markNoShow(bookingId: string): Promise<BookingSummary>;

  listAvailableSlots(offerId: string, fromIso: string, toIso: string): Promise<PublicSlot[]>;
  createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse>;
  getBooking(bookingId: string): Promise<BookingDetails>;
  listMyBookings(cursor?: string | null): Promise<Page<BookingSummary>>;
  cancelBooking(bookingId: string): Promise<CancelBookingResponse>;

  // Prova do serviço (D20).
  getCheckInCode(bookingId: string): Promise<CheckInCodeView>;
  getEntryPass(bookingId: string): Promise<EntryPassView>;
  reportProviderAbsent(bookingId: string): Promise<BookingSummary>;
  answerServiceConfirmation(bookingId: string, answer: 'yes' | 'no'): Promise<BookingSummary>;
  checkInByCode(
    offerId: string,
    slotId: string,
    payload: CodeCheckInPayload
  ): Promise<UnitCheckInResult>;
  checkInEntry(
    offerId: string,
    slotId: string,
    payload: EntryCheckInPayload
  ): Promise<UnitCheckInResult>;
  getEntryVerificationKeys(
    offerId: string
  ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>>;
  recordArrival(
    offerId: string,
    bookingId: string,
    location?: ArrivalLocation
  ): Promise<BookingSummary>;
  checkInWithoutCode(
    offerId: string,
    bookingId: string,
    payload: { reason: NoCodeReason }
  ): Promise<BookingSummary>;
  setParticipantName(
    bookingId: string,
    unit: number,
    name: string
  ): Promise<{ unit: number; name: string; changed: boolean }>;
  answerProviderAbsence(
    offerId: string,
    bookingId: string,
    answer: 'was_there' | 'admitted'
  ): Promise<BookingSummary>;
}
