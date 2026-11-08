import type { TFunction } from 'i18next';
import { formatBusinessDay } from '../../../shared/utils/businessDateTime';
import { formatMoneyMinorCompact } from '../../../shared/utils/money';
import type { PartnerPayoutGroup } from '../types/partnerHome';

const HOLD_REASONS = new Set(['claim', 'dispute', 'service_proof']);

/** Dias de serviço sem repetir, em ordem: "3 de nov. e 4 de nov.". */
export function serviceDays(group: PartnerPayoutGroup, locale: string): string {
  const days = [...new Set(group.lines.map((line) => line.serviceEndsAt).sort())].map((iso) =>
    formatBusinessDay(iso, locale)
  );
  return new Intl.ListFormat(locale, { type: 'conjunction' }).format([...new Set(days)]);
}

/** Linha do repasse em Ganhos (p20). */
export function payoutRow(group: PartnerPayoutGroup, t: TFunction, locale: string) {
  const amount = formatMoneyMinorCompact(group.amountMinor, locale);
  const first = group.lines[0];
  if (group.status === 'held') {
    const reason = group.holdReasons.find((item) => HOLD_REASONS.has(item)) ?? 'claim';
    return {
      title: [first?.title, serviceDays(group, locale), amount].filter(Boolean).join(' · '),
      sub: t(`partnerEarnings.hold.${reason}`),
    };
  }
  const titles = new Set(group.lines.map((line) => line.title));
  const dates = serviceDays(group, locale);
  return {
    title: `${formatBusinessDay(group.date, locale)} · ${amount}`,
    sub:
      titles.size === 1 && first?.title
        ? t('partnerEarnings.single', { title: first.title, dates })
        : t('partnerEarnings.many', { count: group.lines.length, dates }),
  };
}

/** Totais da folha (p21): vendido sem a taxa de serviço e o que já voltou ao comprador. */
export function payoutTotals(group: PartnerPayoutGroup) {
  const soldMinor = group.lines.reduce(
    (sum, line) => sum + line.grossMinor - line.serviceFeeMinor - line.refundedMinor,
    0
  );
  const feeMinor = group.lines.reduce((sum, line) => sum + line.platformFeeMinor, 0);
  const offsetMinor = group.lines.reduce((sum, line) => sum + line.offsetMinor, 0);
  return { soldMinor, feeMinor, offsetMinor, receiveMinor: group.amountMinor };
}
