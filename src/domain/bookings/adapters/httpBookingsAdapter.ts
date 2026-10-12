import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { BookingsApiPort } from '../ports/bookingsApiPort';
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
}
