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
  /** Onde o serviço começa: no ponto de encontro ou onde o comprador está (D20). */
  pickupMode?: 'meeting_point' | 'buyer_address';
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
  /** Aviso de nova data (D16, 4A): até 7 dias depois, o cancelamento devolve tudo. */
  rescheduledAt: string | null;
  /** Onde o comprador está, quando a oferta busca no endereço (D20). */
  pickupAddress: string | null;
  checkIn: { at: string; method: CheckInMethod; participantsPresent: number } | null;
  /** "Cheguei" do prestador (D20). */
  arrivedAt: string | null;
  providerAbsence: {
    reportedAt: string;
    respondBy: string;
    answer: 'was_there' | 'admitted' | null;
    resolution: 'refunded' | 'withdrawn' | 'admin' | null;
  } | null;
  serviceConfirmation: {
    askedAt: string;
    answerBy: string;
    answer: 'yes' | 'no' | null;
    resolution: 'confirmed' | 'admin' | 'refunded' | null;
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
  pickupAddress?: string;
  idempotencyKey: string;
  locale: 'pt-BR' | 'en' | 'fr';
  acceptedTermsVersion: string;
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

export type CheckInMethod = 'code' | 'qr' | 'no_code';
export type NoCodeReason = 'no_phone' | 'refused' | 'other';

/** Código de check-in do comprador; `code` só no dia do serviço (D20). */
export interface CheckInCodeView {
  code: string | null;
  visibleFrom: string;
  validUntil: string;
  checkedInAt: string | null;
}

/** QR e código de 8 caracteres da entrada de atração (D20). */
export interface EntryPassView {
  qrToken: string | null;
  code: string | null;
  visibleFrom: string;
  validUntil: string;
  checkedInAt: string | null;
}

export interface CodeCheckInPayload {
  code: string;
  participantsPresent: number;
  /** Hora do aparelho quando o código foi digitado sem internet. */
  capturedAt?: string;
}

export interface EntryCheckInPayload {
  qrToken?: string;
  code?: string;
  participantsPresent: number;
  capturedAt?: string;
}

export interface ArrivalLocation {
  lat: number;
  lng: number;
  accuracyM?: number;
}
