import {
  businessDateTimeToIso,
  isoToBusinessDateTime,
} from '../../../shared/utils/businessDateTime';
import {
  type PartnerPromoCode,
  PROMO_CODE_PATTERN,
  PROMO_MAX_PERCENT,
  type PromoCodeInput,
  type PromoDiscountType,
} from '../types/promoCode';

/** Campos do formulário como a pessoa digita; datas em `datetime-local` no fuso do negócio. */
export interface PromoFormDraft {
  code: string;
  type: PromoDiscountType;
  percent: string;
  valueMinor: number;
  targets: Record<string, string[] | null>;
  limitUses: boolean;
  maxUses: string;
  onePerAccount: boolean;
  limitTickets: boolean;
  maxTickets: string;
  startsAt: string;
  endsAt: string;
}

export function draftFromPromo(
  promo: PartnerPromoCode | null,
  eventId: string | null
): PromoFormDraft {
  if (!promo) {
    return {
      code: '',
      type: 'percentage',
      percent: '10',
      valueMinor: 0,
      targets: eventId ? { [eventId]: null } : {},
      limitUses: false,
      maxUses: '100',
      onePerAccount: true,
      limitTickets: false,
      maxTickets: '1',
      startsAt: '',
      endsAt: '',
    };
  }
  return {
    code: promo.code,
    type: promo.type,
    percent: String(promo.percentage ?? 10),
    valueMinor: promo.valueMinor ?? 0,
    targets: Object.fromEntries(promo.targets.map((target) => [target.id, target.optionIds])),
    limitUses: promo.maxUses !== null,
    maxUses: String(promo.maxUses ?? 100),
    onePerAccount: promo.onePerAccount,
    limitTickets: promo.maxTicketsPerOrder !== null,
    maxTickets: String(promo.maxTicketsPerOrder ?? 1),
    startsAt: promo.startsAt ? isoToBusinessDateTime(promo.startsAt) : '',
    endsAt: promo.endsAt ? isoToBusinessDateTime(promo.endsAt) : '',
  };
}

const whole = (raw: string) => (/^\d{1,6}$/.test(raw.trim()) ? Number(raw.trim()) : Number.NaN);

/**
 * Cupom pronto para enviar ou a chave `promoCodes.form.errors.*` do primeiro problema. `usedCount`
 * vale para cupom já usado: o limite não pode ficar abaixo dele.
 */
export function inputFromDraft(
  draft: PromoFormDraft,
  usedCount = 0
): { input: PromoCodeInput } | { error: string } {
  const code = draft.code.trim().toUpperCase();
  if (!PROMO_CODE_PATTERN.test(code)) return { error: 'code' };
  const percent = whole(draft.percent);
  if (draft.type === 'percentage' && !(percent >= 1 && percent <= PROMO_MAX_PERCENT)) {
    return { error: 'percent' };
  }
  if (draft.type === 'fixed' && draft.valueMinor < 1) return { error: 'value' };
  const targets = Object.entries(draft.targets).map(([id, optionIds]) => ({
    kind: 'event' as const,
    id,
    optionIds,
  }));
  if (targets.length === 0) return { error: 'targets' };
  if (targets.some((target) => target.optionIds !== null && target.optionIds.length === 0)) {
    return { error: 'options' };
  }
  const maxUses = draft.limitUses ? whole(draft.maxUses) : null;
  if (maxUses !== null && !(maxUses >= Math.max(1, usedCount))) return { error: 'maxUses' };
  const maxTickets =
    draft.type === 'percentage' && draft.limitTickets ? whole(draft.maxTickets) : null;
  if (maxTickets !== null && !(maxTickets >= 1 && maxTickets <= 50)) return { error: 'maxTickets' };
  const startsAt = businessDateTimeToIso(draft.startsAt) || null;
  const endsAt = businessDateTimeToIso(draft.endsAt) || null;
  if (startsAt && endsAt && startsAt >= endsAt) return { error: 'period' };
  return {
    input: {
      code,
      type: draft.type,
      percentage: draft.type === 'percentage' ? percent : null,
      valueMinor: draft.type === 'fixed' ? draft.valueMinor : null,
      targets,
      maxUses,
      onePerAccount: draft.onePerAccount,
      maxTicketsPerOrder: maxTickets,
      startsAt,
      endsAt,
    },
  };
}
