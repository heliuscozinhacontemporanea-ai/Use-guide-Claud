import type { BookingCancellationPolicy } from '../../../shared/utils/cancellationPolicy';

/** Espelho neutro dos DTOs de saída da API de reservas (server/interfaces/http/bookings). */
export type LocalizedText = { 'pt-BR': string; en?: string; fr?: string };

export type OfferKind = 'tour' | 'private_entry';
export type OfferStatus = 'draft' | 'published' | 'paused' | 'archived';

export interface PriceOption {
  id: string;
  label: LocalizedText;
  unitAmountMinor: number;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface OfferFields {
  title: LocalizedText;
  description?: LocalizedText;
  pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
  durationMinutes?: number;
  meetingPoint?: { address: string; instructions?: LocalizedText };
  cancellationPolicy: BookingCancellationPolicy;
  maxParticipantsPerBooking: number;
  requiresParticipantNames: boolean;
}

export interface PartnerOffer extends OfferFields {
  id: string;
  guideItemId: string;
  kind: OfferKind;
  status: OfferStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload extends OfferFields {
  guideItemId: string;
  kind: OfferKind;
}

export type SlotStatus = 'open' | 'closed' | 'canceled';

export interface PartnerSlot {
  id: string;
  startsAt: string;
  endsAt: string | null;
  capacityTotal: number;
  capacityReserved: number;
  capacitySold: number;
  status: SlotStatus;
}

export interface PublicSlot {
  id: string;
  startsAt: string;
  endsAt?: string;
  available: number;
}

export type CreateSlotsPayload =
  | { mode: 'list'; capacity: number; slots: Array<{ startsAt: string }> }
  | {
      mode: 'recurrence';
      capacity: number;
      startDate: string;
      endDate: string;
      weekdays: number[];
      times: string[];
    };

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'refunded'
  | 'expired'
  | 'no_show'
  | 'disputed';

export interface BookingSummary {
  id: string;
  offerId: string;
  slotId: string;
  guideItemId: string;
  kind: OfferKind;
  status: BookingStatus;
  lines: Array<{ priceOptionId: string; quantity: number; unitAmountMinor: number }>;
  participantsCount: number;
  totalMinor: number;
  expiresAt: string | null;
  offer: {
    title: string;
    startsAt: string;
    durationMinutes: number | null;
    meetingPoint: string | null;
    cancellationPolicy: BookingCancellationPolicy;
  };
  cancellation: {
    by: 'buyer' | 'partner' | 'system';
    refundPercent: number;
    refundAmountMinor: number;
    at: string;
  } | null;
  createdAt: string;
  /** Só na visão do parceiro vendedor. */
  buyerId?: string;
  platformFeeMinor?: number;
}

export interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

/** Item do guia do parceiro que pode virar oferta (passeio ou atração). */
export interface BookableGuideItem {
  id: string;
  name: string;
  category: string;
}

/** Oferta publicada lida da projeção pública `publicBookableOffers` (sem dono nem parceiro). */
export interface PublicOffer extends OfferFields {
  id: string;
  guideItemId: string;
  kind: OfferKind;
  status: 'published';
  updatedAt: string;
}

export interface CreateBookingPayload {
  offerId: string;
  slotId: string;
  lines: Array<{ priceOptionId: string; quantity: number }>;
  participants: Array<{ name: string }>;
  idempotencyKey: string;
  locale: 'pt-BR' | 'en' | 'fr';
}

export interface CreateBookingResponse {
  bookingId: string;
  status: BookingStatus;
  clientSecret: string;
  totalMinor: number;
  expiresAt: string | null;
}

export interface BookingDetails extends BookingSummary {
  participants: Array<{ name: string; isLeadContact: boolean }>;
}

export interface CancelBookingResponse {
  status: BookingStatus;
  refundPercent: number;
  refundAmountMinor: number;
}
