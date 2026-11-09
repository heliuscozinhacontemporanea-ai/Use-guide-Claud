import { PLATFORM_TIME_ZONE } from '../../../shared/utils/timeZones';
import { formatMoneyMinor } from '../../../shared/utils/money';

/** Valor do plano em centavos formatado em BRL no idioma ativo. */
export function formatPlanAmount(amountMinor: number, locale: string): string {
  return formatMoneyMinor(amountMinor, locale);
}

export function formatBillingDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: PLATFORM_TIME_ZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
