import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
import type { BookingCancellationPolicy } from '../../../shared/kernel/cancellationPolicy';
import type { Locale } from '../../../shared/kernel/locale';

/** Texto cadastrado pelo parceiro; pt-BR é obrigatório (AGENTS.md §12.6). */
export type LocalizedText = { 'pt-BR': string; en?: string; fr?: string };

/** Fase 1 vende só `tour` e `private_entry`; os outros já existem no modelo (decisão D3). */
export type BookableOfferKind = 'tour' | 'private_entry' | 'rental' | 'transfer';
export const AVAILABLE_OFFER_KINDS: readonly BookableOfferKind[] = ['tour', 'private_entry'];

export type BookableOfferStatus = 'draft' | 'published' | 'paused' | 'archived';

/** Tipos com check-in por código de 6 caracteres (D20); a entrada de atração privada usa QR Code. */
export const CHECK_IN_CODE_KINDS: readonly BookableOfferKind[] = ['tour', 'rental', 'transfer'];

/** Onde o serviço começa: no ponto de encontro da oferta ou no endereço que o comprador informa (D20). */
export type PickupMode = 'meeting_point' | 'buyer_address';

export interface PriceOption {
  id: string;
  label: LocalizedText;
  unitAmountMinor: number;
  minQuantity?: number;
  maxQuantity?: number;
}

/** Translado tem opções próprias (Código Civil art. 740); os outros tipos usam as de reserva (D14). */
export function cancellationFamilyOf(kind: BookableOfferKind): 'booking' | 'transfer' {
  return kind === 'transfer' ? 'transfer' : 'booking';
}

export interface MeetingPoint {
  address: string;
  lat?: number;
  lng?: number;
  instructions?: LocalizedText;
}

export interface BookableOffer {
  id: string;
  guideItemId: string;
  ownerId: string;
  partnerId: string;
  kind: BookableOfferKind;
  title: LocalizedText;
  description?: LocalizedText;
  status: BookableOfferStatus;
  pricing: { currency: 'BRL'; priceOptions: PriceOption[] };
  durationMinutes?: number;
  meetingPoint?: MeetingPoint;
  pickupMode?: PickupMode;
  cancellationPolicy: BookingCancellationPolicy;
  maxParticipantsPerBooking: number;
  requiresParticipantNames: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Projeção pública lida pelo cliente em `publicBookableOffers` (sem dono nem parceiro). */
export type PublicBookableOffer = Omit<BookableOffer, 'ownerId' | 'partnerId' | 'createdAt'>;

export type AvailabilitySlotStatus = 'open' | 'closed' | 'canceled';

export interface AvailabilitySlot {
  id: string;
  offerId: string;
  startsAt: string;
  endsAt?: string;
  capacityTotal: number;
  capacityReserved: number;
  capacitySold: number;
  status: AvailabilitySlotStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSlot {
  id: string;
  startsAt: string;
  endsAt?: string;
  available: number;
}

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'completed'
  | 'canceled'
  | 'refunded'
  | 'expired'
  | 'no_show'
  | 'disputed';

export interface BookingLine {
  priceOptionId: string;
  quantity: number;
  unitAmountMinor: number;
}

export interface BookingCancellation {
  by: 'buyer' | 'partner' | 'system';
  refundPercent: number;
  refundAmountMinor: number;
  reason: string;
  at: string;
}

/** Check-in do serviço pelo prestador com o código do comprador (D20): prova de que o serviço começou. */
export interface BookingCheckIn {
  /** Hora em que o prestador digitou o código (a do aparelho, quando o check-in foi feito sem internet). */
  at: string;
  byUid: string;
  method: 'code';
  participantsPresent: number;
  /** Só no check-in feito sem internet: quando o servidor recebeu e validou o código. */
  syncedAt?: string;
}

export interface Booking {
  id: string;
  offerId: string;
  slotId: string;
  guideItemId: string;
  buyerId: string;
  sellerPartnerId: string;
  kind: BookableOfferKind;
  status: BookingStatus;
  lines: BookingLine[];
  participantsCount: number;
  subtotalMinor: number;
  platformFeeMinor: number;
  totalMinor: number;
  expiresAt: string | null;
  paymentIntentId?: string;
  offerSnapshot: {
    title: string;
    startsAt: string;
    durationMinutes?: number;
    meetingPoint?: string;
    cancellationPolicy: BookingCancellationPolicy;
  };
  /** Aviso de nova data pelo parceiro: até 7 dias depois, o comprador cancela com reembolso integral (D16, 4A). */
  rescheduledAt?: string;
  /** Gravado ao cancelar: torna o cancelamento repetível sem recalcular o reembolso. */
  cancellation?: BookingCancellation;
  /** Versão dos termos aceita na compra (D15). */
  termsAcceptance?: TermsAcceptance;
  /** Onde o comprador está (hospedagem ou endereço), quando a oferta busca no endereço. PII (§7.6). */
  pickupAddress?: string;
  checkIn?: BookingCheckIn;
  locale: Locale;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingParticipant {
  name: string;
  isLeadContact: boolean;
}

/** Quem age na operação. Neutro de propósito: o domínio não conhece a camada application. */
export interface BookingActor {
  uid: string;
  admin: boolean;
}

export interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

export const BOOKING_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending_payment: ['confirmed', 'expired', 'canceled'],
  confirmed: ['completed', 'canceled', 'no_show', 'disputed'],
  canceled: ['refunded'],
  completed: ['disputed'],
  refunded: [],
  expired: [],
  no_show: ['disputed'],
  disputed: ['confirmed', 'refunded'],
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[from].includes(to);
}
