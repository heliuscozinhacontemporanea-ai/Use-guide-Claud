import type { TFunction } from 'i18next';
import { formatBusinessDateTime } from '../../../shared/utils/businessDateTime';
import { formatMoneyMinor } from '../../../shared/utils/money';
import type { StatusTone } from '../../../ui/components/StatusText';
import type { PartnerPromoCode, PromoStatus } from '../types/promoCode';

export const PROMO_TONE: Record<PromoStatus, StatusTone> = {
  active: 'success',
  scheduled: 'info',
  paused: 'muted',
  exhausted: 'warn',
  ended: 'muted',
};

/** "10% por ingresso" ou "R$ 20,00 por compra". */
export function promoDiscountText(promo: PartnerPromoCode, t: TFunction, locale: string) {
  return promo.type === 'percentage'
    ? t('promoCodes.discount.percentage', { value: promo.percentage ?? 0 })
    : t('promoCodes.discount.fixed', { value: formatMoneyMinor(promo.valueMinor ?? 0, locale) });
}

/** "3 de 100 usos" ou "3 usos". */
export function promoUsesText(promo: PartnerPromoCode, t: TFunction) {
  return promo.maxUses === null
    ? t('promoCodes.uses.free', { count: promo.usedCount })
    : t('promoCodes.uses.limited', { count: promo.usedCount, max: promo.maxUses });
}

/** Anúncios onde o cupom vale, em uma linha. */
export function promoTargetsText(promo: PartnerPromoCode, t: TFunction) {
  const titles = promo.targets.map((target) => target.title ?? t('promoCodes.unknownTarget'));
  return titles.length <= 2
    ? titles.join(', ')
    : t('promoCodes.targetsMore', { first: titles[0], count: titles.length - 1 });
}

/** Período no fuso do negócio; `null` quando o cupom não tem datas. */
export function promoPeriodText(promo: PartnerPromoCode, t: TFunction, locale: string) {
  const start = promo.startsAt ? formatBusinessDateTime(promo.startsAt, locale) : null;
  const end = promo.endsAt ? formatBusinessDateTime(promo.endsAt, locale) : null;
  if (start && end) return t('promoCodes.period.between', { start, end });
  if (start) return t('promoCodes.period.from', { start });
  if (end) return t('promoCodes.period.until', { end });
  return null;
}
