import { formatMoneyMinor } from '../../../shared/utils/money';

/** Valor do plano em centavos formatado em BRL no idioma ativo. */
export function formatPlanAmount(amountMinor: number, locale: string): string {
  return formatMoneyMinor(amountMinor, locale);
}

export function formatBillingDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(new Date(iso));
}
