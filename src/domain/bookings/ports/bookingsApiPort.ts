import type {
  BookingDetails,
  BookingSummary,
  CancelBookingResponse,
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
  listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>>;
  markNoShow(bookingId: string): Promise<BookingSummary>;

  listAvailableSlots(offerId: string, fromIso: string, toIso: string): Promise<PublicSlot[]>;
  createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse>;
  getBooking(bookingId: string): Promise<BookingDetails>;
  listMyBookings(cursor?: string | null): Promise<Page<BookingSummary>>;
  cancelBooking(bookingId: string): Promise<CancelBookingResponse>;
}
