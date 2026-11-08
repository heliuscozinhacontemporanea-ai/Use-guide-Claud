import {
  isPromoLocked,
  type PromoCode,
  type PromoStatus,
  promoStatus,
} from '../../../domain/promotions';
import type { PromoListingTarget } from './promoTargets';

/** Cupom como o painel recebe: só o dono vê; sem os IDs de quem usou (§7.9 regra 4). */
export interface PartnerPromoCodeView {
  id: string;
  code: string;
  type: PromoCode['type'];
  percentage: number | null;
  valueMinor: number | null;
  targets: Array<{
    kind: 'event' | 'offer';
    id: string;
    title: string | null;
    optionIds: string[] | null;
    optionNames: string[];
  }>;
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

export function toPartnerPromoCodeView(
  promo: PromoCode,
  listings: PromoListingTarget[],
  nowIso: string
): PartnerPromoCodeView {
  const byKey = new Map(listings.map((listing) => [`${listing.kind}:${listing.id}`, listing]));
  return {
    id: promo.id,
    code: promo.code,
    type: promo.type,
    percentage: promo.percentage,
    valueMinor: promo.valueMinor,
    targets: promo.targets.map((target) => {
      const listing = byKey.get(`${target.kind}:${target.id}`);
      const names = new Map(listing?.options.map((option) => [option.id, option.name]) ?? []);
      return {
        kind: target.kind,
        id: target.id,
        title: listing?.title ?? null,
        optionIds: target.optionIds,
        // O mesmo lote costuma repetir em cada sessão; o nome aparece uma vez.
        optionNames: [
          ...new Set(
            (target.optionIds ?? []).flatMap((id) => (names.has(id) ? [names.get(id) ?? ''] : []))
          ),
        ],
      };
    }),
    maxUses: promo.maxUses,
    usedCount: promo.usedCount,
    onePerAccount: promo.onePerAccount,
    maxTicketsPerOrder: promo.maxTicketsPerOrder,
    startsAt: promo.startsAt,
    endsAt: promo.endsAt,
    status: promoStatus(promo, nowIso),
    locked: isPromoLocked(promo),
    createdAt: promo.createdAt,
  };
}
