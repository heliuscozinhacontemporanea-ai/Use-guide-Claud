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

/** Check-in do serviço pelo prestador (D20): prova de que o serviço começou. */
export interface BookingCheckIn {
  /** Hora em que o prestador fez o check-in (a do aparelho, quando foi feito sem internet). */
  at: string;
  byUid: string;
  /** `no_code`: "Cliente sem código", por conta e risco do prestador até o comprador confirmar. */
  method: 'code' | 'no_code';
  participantsPresent: number;
  /** Só no check-in feito sem internet: quando o servidor recebeu e validou o código. */
  syncedAt?: string;
  noCodeReason?: NoCodeReason;
}

export const NO_CODE_REASONS = ['no_phone', 'refused', 'other'] as const;
export type NoCodeReason = (typeof NO_CODE_REASONS)[number];

/** "Cheguei": hora e localização do prestador no ponto de encontro ou no endereço (D20). */
export interface BookingArrival {
  at: string;
  byUid: string;
  /** Prova para o admin; nunca vai para log (AGENTS.md §10.3). */
  location?: { lat: number; lng: number; accuracyM?: number };
}

/** "O prestador não veio": o comprador relata e o prestador tem 2 h para responder (D20). */
export interface BookingProviderAbsence {
  reportedAt: string;
  respondBy: string;
  /** Reclamação aberta junto, que retém o repasse e leva o caso ao admin. */
  claimId: string;
  answer?: 'was_there' | 'admitted';
  answeredAt?: string;
  /** refunded: sem resposta ou admitida; withdrawn: o prestador fez o check-in; admin: disse que foi. */
  resolution?: 'refunded' | 'withdrawn' | 'admin';
  resolvedAt?: string;
}

/** "O serviço aconteceu?": pergunta ao comprador quando falta a prova do código (D20). */
export interface BookingServiceConfirmation {
  askedAt: string;
  answerBy: string;
  reason: 'no_code' | 'no_record';
  answer?: 'yes' | 'no';
  answeredAt?: string;
  claimId?: string;
  /** confirmed: respondeu sim; admin: respondeu não; refunded: não respondeu em 72 h. */
  resolution?: 'confirmed' | 'admin' | 'refunded';
}

/** Próximo prazo da reserva, num campo só para o job buscar por data (D20). */
export interface BookingDeadline {
  kind: 'provider_absence_response' | 'service_confirmation';
  at: string;
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
  /** Quando o endereço de busca é apagado: 7 dias depois do fim do serviço (D20, §7.5). */
  pickupAddressEraseAt?: string;
  checkIn?: BookingCheckIn;
  arrival?: BookingArrival;
  providerAbsence?: BookingProviderAbsence;
  serviceConfirmation?: BookingServiceConfirmation;
  deadline?: BookingDeadline;
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
