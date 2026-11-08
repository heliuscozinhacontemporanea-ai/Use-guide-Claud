/** Cupom do parceiro como `/api/promo-codes` devolve (B1). */
export type PromoStatus = 'active' | 'paused' | 'scheduled' | 'ended' | 'exhausted';
export type PromoDiscountType = 'percentage' | 'fixed';

export type PromoTargetKind = 'event' | 'offer';

export interface PromoTargetInput {
  kind: PromoTargetKind;
  id: string;
  /** Lotes do evento ou opções de preço da oferta com desconto; `null` é todos. */
  optionIds: string[] | null;
}

export interface PartnerPromoCode {
  id: string;
  code: string;
  type: PromoDiscountType;
  percentage: number | null;
  valueMinor: number | null;
  targets: Array<PromoTargetInput & { title: string | null; optionNames: string[] }>;
  maxUses: number | null;
  usedCount: number;
  onePerAccount: boolean;
  maxTicketsPerOrder: number | null;
  startsAt: string | null;
  endsAt: string | null;
  status: PromoStatus;
  /** Já usado: só limite, fim e pausa mudam; não pode ser excluído. */
  locked: boolean;
  createdAt: string;
}

/** Evento (lotes por sessão) ou oferta de reserva (opções de preço) onde o parceiro cria cupom. */
export interface PromoListingTarget {
  kind: PromoTargetKind;
  id: string;
  title: string;
  status: string;
  /** Passeio, aluguel, translado ou entrada; só na oferta. */
  offerKind: string | null;
  options: Array<{ id: string; name: string; sessionStartsAt: string | null }>;
}

export interface PromoCodesData {
  promoCodes: PartnerPromoCode[];
  targets: PromoListingTarget[];
}

export const promoTargetKey = (target: { kind: PromoTargetKind; id: string }) =>
  `${target.kind}:${target.id}`;

export interface PromoCodeInput {
  code: string;
  type: PromoDiscountType;
  percentage: number | null;
  valueMinor: number | null;
  targets: PromoTargetInput[];
  maxUses: number | null;
  onePerAccount: boolean;
  maxTicketsPerOrder: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface PromoCodeLimitsEdit {
  maxUses?: number | null;
  endsAt?: string | null;
  isActive?: boolean;
}

/** Igual ao servidor: ingresso grátis só por cortesia. */
export const PROMO_MAX_PERCENT = 90;
export const PROMO_CODE_PATTERN = /^[A-Z0-9]{3,20}$/;
