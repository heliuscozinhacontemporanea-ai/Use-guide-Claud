/** Cupom do parceiro como `/api/promo-codes` devolve (B1). */
export type PromoStatus = 'active' | 'paused' | 'scheduled' | 'ended' | 'exhausted';
export type PromoDiscountType = 'percentage' | 'fixed';

export interface PromoTargetInput {
  kind: 'event';
  id: string;
  /** Lotes com desconto; `null` é todos. */
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

/** Evento onde o parceiro pode criar cupom, com os lotes de cada sessão. */
export interface PromoEventTarget {
  id: string;
  title: string;
  status: string;
  options: Array<{ id: string; name: string; sessionStartsAt: string }>;
}

export interface PromoCodesData {
  promoCodes: PartnerPromoCode[];
  events: PromoEventTarget[];
}

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
