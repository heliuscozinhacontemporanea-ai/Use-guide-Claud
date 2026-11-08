/**
 * Cupom de desconto do parceiro (B1, aprovado em 2026-11-07). Classe Interna: só o dono lê, pela API;
 * o comprador só informa o código na compra. Vale para um ou mais anúncios do mesmo dono.
 */
/** Evento (lotes de ingresso) ou oferta de reserva: passeio, aluguel, translado, entrada (B1c). */
export type PromoTargetKind = 'event' | 'offer';

export interface PromoTarget {
  kind: PromoTargetKind;
  id: string;
  /** Lotes do evento ou opções de preço da oferta com desconto; sem a lista, todos. */
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

/** Cartão "Cupons" do Início (2026-11-08): só números do dono, sem quem usou. */
export interface PromoCodesSummary {
  /** Ativos ou agendados. */
  active: number;
  /** Compras com cupom nos últimos 7 dias (pagas ou aguardando pagamento). */
  weekUses: number;
  top: { code: string; uses: number } | null;
  /** O que acaba primeiro: em até 3 dias ou com 80% dos usos gastos. */
  alert:
    | { code: string; kind: 'ending'; endsAt: string }
    | { code: string; kind: 'running_out'; used: number; max: number }
    | null;
}

export const PROMO_SUMMARY_DAYS = 7;
const ENDING_MS = 3 * 24 * 60 * 60 * 1000;

/** Resumo para o cartão; `null` quando não há cupom ativo nem uso na semana. */
export function summarizePromoCodes(
  promos: PromoCode[],
  weekUsesByPromo: Map<string, number>,
  now: Date
): PromoCodesSummary | null {
  const nowIso = now.toISOString();
  const live = promos.filter((promo) => {
    const status = promoStatus(promo, nowIso);
    return status === 'active' || status === 'scheduled';
  });
  const weekUses = [...weekUsesByPromo.values()].reduce((sum, value) => sum + value, 0);
  if (live.length === 0 && weekUses === 0) return null;
  const byId = new Map(promos.map((promo) => [promo.id, promo]));
  const [topId, topUses] = [...weekUsesByPromo.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
  const top = topId && topUses ? { code: byId.get(topId)?.code ?? '', uses: topUses } : null;
  const ending = live
    .filter((promo) => promo.endsAt && Date.parse(promo.endsAt) - now.getTime() <= ENDING_MS)
    .sort((a, b) => (a.endsAt ?? '').localeCompare(b.endsAt ?? ''))[0];
  const runningOut = live.find(
    (promo) => promo.maxUses !== null && promo.usedCount >= Math.ceil(promo.maxUses * 0.8)
  );
  const alert = ending?.endsAt
    ? { code: ending.code, kind: 'ending' as const, endsAt: ending.endsAt }
    : runningOut && runningOut.maxUses !== null
      ? {
          code: runningOut.code,
          kind: 'running_out' as const,
          used: runningOut.usedCount,
          max: runningOut.maxUses,
        }
      : null;
  return { active: live.length, weekUses, top, alert };
}
