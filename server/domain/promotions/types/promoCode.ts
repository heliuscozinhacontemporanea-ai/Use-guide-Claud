/**
 * Cupom de desconto do parceiro (B1, aprovado em 2026-11-07). Classe Interna: só o dono lê, pela API;
 * o comprador só informa o código na compra. Vale para um ou mais anúncios do mesmo dono.
 */
export type PromoTargetKind = 'event';

export interface PromoTarget {
  kind: PromoTargetKind;
  id: string;
  /** Lotes (ingressos) com desconto; sem a lista, todos. */
  optionIds: string[] | null;
}

export type PromoDiscountType = 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  ownerId: string;
  /** Maiúsculas, letras e números; único por dono. */
  code: string;
  type: PromoDiscountType;
  /** 1 a 90 (`percentage`). */
  percentage: number | null;
  /** Valor fixo por pedido, em centavos (`fixed`). */
  valueMinor: number | null;
  targets: PromoTarget[];
  /** Compras com o cupom; `null` é sem limite. */
  maxUses: number | null;
  /** Compras que usam o cupom agora (pagas ou aguardando pagamento). */
  usedCount: number;
  /** Primeiro uso; depois dele só limite, fim e pausa mudam. */
  firstUsedAt: string | null;
  onePerAccount: boolean;
  /** Na porcentagem, quantos ingressos do pedido levam desconto; `null` é todos. */
  maxTicketsPerOrder: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeInput {
  code: string;
  type: PromoDiscountType;
  percentage: number | null;
  valueMinor: number | null;
  targets: PromoTarget[];
  maxUses: number | null;
  onePerAccount: boolean;
  maxTicketsPerOrder: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

/** Depois do primeiro uso, só isto muda (edição mista, aprovada em 2026-11-07). */
export interface PromoCodeLimitsEdit {
  maxUses?: number | null;
  endsAt?: string | null;
  isActive?: boolean;
}

/** Desconto máximo: ingresso grátis só por cortesia (Convidados), não por cupom. */
export const PROMO_MAX_PERCENT = 90;
export const PROMO_CODE_PATTERN = /^[A-Z0-9]{3,20}$/;

export type PromoStatus = 'active' | 'paused' | 'scheduled' | 'ended' | 'exhausted';

export function promoTargetKey(target: Pick<PromoTarget, 'kind' | 'id'>): string {
  return `${target.kind}:${target.id}`;
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

/** Situação para o parceiro, na ordem em que impede o uso. */
export function promoStatus(promo: PromoCode, nowIso: string): PromoStatus {
  if (promo.endsAt && promo.endsAt <= nowIso) return 'ended';
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return 'exhausted';
  if (!promo.isActive) return 'paused';
  if (promo.startsAt && promo.startsAt > nowIso) return 'scheduled';
  return 'active';
}

export function isPromoLocked(promo: PromoCode): boolean {
  return promo.firstUsedAt !== null;
}
