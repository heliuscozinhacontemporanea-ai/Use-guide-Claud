import type {
  ArrivalLocation,
  ArrivalResponse,
  BookingContactView,
  BookingDetails,
  BookingSummary,
  CancelBookingResponse,
  CheckInCodeView,
  CodeCheckInPayload,
  CreateBookingPayload,
  CreateBookingResponse,
  CreateOfferPayload,
  CreateSlotsPayload,
  EntryCheckInPayload,
  EntryPassView,
  EstablishmentCheckInResult,
  NoCodeReason,
  OfferFields,
  OfferStatus,
  Page,
  PartnerOffer,
  PartnerSlot,
  PartnerSlotDetail,
  PublicSlot,
  SlotContact,
  UnitCheckInResult,
} from '../types/bookings';

export interface BookingsApiPort {
  listPartnerOffers(): Promise<PartnerOffer[]>;
  createOffer(payload: CreateOfferPayload): Promise<PartnerOffer>;
  updateOffer(offerId: string, payload: Partial<OfferFields>): Promise<PartnerOffer>;
  setOfferStatus(offerId: string, status: Exclude<OfferStatus, 'draft'>): Promise<PartnerOffer>;
  listPartnerSlots(offerId: string, fromIso: string, toIso: string): Promise<PartnerSlot[]>;
  getPartnerSlotDetail(offerId: string, slotId: string): Promise<PartnerSlotDetail>;
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
  /** C2/B37: telefone do outro lado, só com a reserva confirmada e até o fim do serviço. */
  getBookingContact(bookingId: string): Promise<BookingContactView>;
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
  /** "Inserir código" do estabelecimento (D27): qualquer horário aberto do dono no item. */
  checkInByEstablishmentCode(
    guideItemId: string,
    payload: CodeCheckInPayload
  ): Promise<EstablishmentCheckInResult>;
  /** "Cheguei" do horário inteiro (D27). */
  recordSlotArrival(
    offerId: string,
    slotId: string,
    location?: ArrivalLocation
  ): Promise<{ arrivedAt: string | null; waiting: number }>;
  listSlotContacts(offerId: string, slotId: string): Promise<SlotContact[]>;
  respondToArrival(bookingId: string, response: ArrivalResponse): Promise<BookingSummary>;
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
