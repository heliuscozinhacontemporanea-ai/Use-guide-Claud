import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { BookingsApiPort } from '../ports/bookingsApiPort';
import type {
  BookingDetails,
  BookingSummary,
  CancelBookingResponse,
  ArrivalLocation,
  CheckInCodeView,
  CodeCheckInPayload,
  EntryCheckInPayload,
  EntryPassView,
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

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function call<T>(
  path: string,
  init: RequestInit = { method: 'GET' },
  options: { requireAuth: boolean; requireAppCheck: boolean } = OPTIONS
): Promise<T> {
  const response = await firebaseApiFetch(path, init, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
  }
  return data as T;
}

function json(method: 'POST' | 'PATCH', body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

const offerPath = (offerId: string) => `/api/partners/offers/${encodeURIComponent(offerId)}`;
const slotPath = (offerId: string, slotId: string) =>
  `${offerPath(offerId)}/slots/${encodeURIComponent(slotId)}`;
const offerBookingPath = (offerId: string, bookingId: string) =>
  `${offerPath(offerId)}/bookings/${encodeURIComponent(bookingId)}`;
const bookingPath = (bookingId: string) => `/api/bookings/${encodeURIComponent(bookingId)}`;

export class HttpBookingsAdapter implements BookingsApiPort {
  async listPartnerOffers(): Promise<PartnerOffer[]> {
    return (await call<{ data: PartnerOffer[] }>('/api/partners/offers')).data;
  }

  async createOffer(payload: CreateOfferPayload): Promise<PartnerOffer> {
    return call('/api/partners/offers', json('POST', payload));
  }

  async updateOffer(offerId: string, payload: Partial<OfferFields>): Promise<PartnerOffer> {
    return call(offerPath(offerId), json('PATCH', payload));
  }

  async setOfferStatus(
    offerId: string,
    status: Exclude<OfferStatus, 'draft'>
  ): Promise<PartnerOffer> {
    return call(`${offerPath(offerId)}/status`, json('POST', { status }));
  }

  async listPartnerSlots(offerId: string, fromIso: string, toIso: string): Promise<PartnerSlot[]> {
    const query = new URLSearchParams({ from: fromIso, to: toIso });
    return (await call<{ data: PartnerSlot[] }>(`${offerPath(offerId)}/slots?${query}`)).data;
  }

  async createSlots(offerId: string, payload: CreateSlotsPayload): Promise<PartnerSlot[]> {
    return (
      await call<{ data: PartnerSlot[] }>(`${offerPath(offerId)}/slots`, json('POST', payload))
    ).data;
  }

  async cancelSlot(offerId: string, slotId: string): Promise<{ canceledBookings: number }> {
    return call(
      `${offerPath(offerId)}/slots/${encodeURIComponent(slotId)}/cancel`,
      json('POST', {})
    );
  }

  async rescheduleSlot(
    offerId: string,
    slotId: string,
    change: { startsAt: string; reason: string }
  ): Promise<{ rescheduledBookings: number }> {
    return call(
      `${offerPath(offerId)}/slots/${encodeURIComponent(slotId)}/reschedule`,
      json('POST', change)
    );
  }

  async listOfferBookings(offerId: string, cursor?: string | null): Promise<Page<BookingSummary>> {
    const query = new URLSearchParams({ limit: '20', ...(cursor ? { cursor } : {}) });
    return call(`${offerPath(offerId)}/bookings?${query}`);
  }

  async markNoShow(bookingId: string): Promise<BookingSummary> {
    return call(`/api/bookings/${encodeURIComponent(bookingId)}/no-show`, json('POST', {}));
  }

  async listAvailableSlots(offerId: string, fromIso: string, toIso: string): Promise<PublicSlot[]> {
    const query = new URLSearchParams({ from: fromIso, to: toIso });
    const path = `/api/bookings/offers/${encodeURIComponent(offerId)}/slots?${query}`;
    // Rota pública: vagas livres podem ser vistas sem login.
    return (
      await call<{ data: PublicSlot[] }>(
        path,
        { method: 'GET' },
        { requireAuth: false, requireAppCheck: true }
      )
    ).data;
  }

  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    return call('/api/bookings', json('POST', payload));
  }

  async getBooking(bookingId: string): Promise<BookingDetails> {
    return call(`/api/bookings/${encodeURIComponent(bookingId)}`);
  }

  async listMyBookings(cursor?: string | null): Promise<Page<BookingSummary>> {
    const query = new URLSearchParams({ limit: '20', ...(cursor ? { cursor } : {}) });
    return call(`/api/bookings/me?${query}`);
  }

  async cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
    return call(`/api/bookings/${encodeURIComponent(bookingId)}/cancel`, json('POST', {}));
  }

  async getCheckInCode(bookingId: string): Promise<CheckInCodeView> {
    return call(`${bookingPath(bookingId)}/check-in-code`);
  }

  async getEntryPass(bookingId: string): Promise<EntryPassView> {
    return call(`${bookingPath(bookingId)}/entry-pass`);
  }

  async reportProviderAbsent(bookingId: string): Promise<BookingSummary> {
    return call(`${bookingPath(bookingId)}/provider-absent`, json('POST', {}));
  }

  async answerServiceConfirmation(
    bookingId: string,
    answer: 'yes' | 'no'
  ): Promise<BookingSummary> {
    return call(`${bookingPath(bookingId)}/service-confirmation`, json('POST', { answer }));
  }

  async checkInByCode(
    offerId: string,
    slotId: string,
    payload: CodeCheckInPayload
  ): Promise<BookingSummary> {
    return call(`${slotPath(offerId, slotId)}/check-ins`, json('POST', payload));
  }

  async checkInEntry(
    offerId: string,
    slotId: string,
    payload: EntryCheckInPayload
  ): Promise<BookingSummary> {
    return call(`${slotPath(offerId, slotId)}/entry-check-ins`, json('POST', payload));
  }

  async getEntryVerificationKeys(
    offerId: string
  ): Promise<Array<{ kid: string; publicKeyJwk: JsonWebKey }>> {
    return (
      await call<{ data: Array<{ kid: string; publicKeyJwk: JsonWebKey }> }>(
        `${offerPath(offerId)}/entry-verification-keys`
      )
    ).data;
  }

  async recordArrival(
    offerId: string,
    bookingId: string,
    location?: ArrivalLocation
  ): Promise<BookingSummary> {
    return call(
      `${offerBookingPath(offerId, bookingId)}/arrival`,
      json('POST', location ? { location } : {})
    );
  }

  async checkInWithoutCode(
    offerId: string,
    bookingId: string,
    payload: { participantsPresent: number; reason: NoCodeReason }
  ): Promise<BookingSummary> {
    return call(
      `${offerBookingPath(offerId, bookingId)}/check-in-without-code`,
      json('POST', payload)
    );
  }

  async answerProviderAbsence(
    offerId: string,
    bookingId: string,
    answer: 'was_there' | 'admitted'
  ): Promise<BookingSummary> {
    return call(
      `${offerBookingPath(offerId, bookingId)}/absence-response`,
      json('POST', { answer })
    );
  }
}
