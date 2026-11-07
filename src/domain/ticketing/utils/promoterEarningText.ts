import type { TFunction } from 'i18next';
import { formatMoneyMinorCompact } from '../../../shared/utils/money';
import type { PromoterEarning } from '../types/promoter';

/** "Comissão de 10%", "R$ 15 por ingresso" ou "Cachê de R$ 500" no idioma ativo. */
export function promoterEarningText(
  t: TFunction,
  earning: PromoterEarning,
  locale: string
): string {
  if (earning.type === 'commission') {
    const percent = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(
      earning.basisPoints / 100
    );
    return t('promoters.earning.commission', { percent });
  }
  const amount = formatMoneyMinorCompact(earning.amountMinor, locale);
  return t(
    earning.type === 'per_ticket' ? 'promoters.earning.perTicket' : 'promoters.earning.flatFee',
    {
      amount,
    }
  );
}
