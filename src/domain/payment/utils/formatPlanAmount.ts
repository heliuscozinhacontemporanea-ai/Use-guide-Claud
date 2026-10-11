/** Valor do plano em reais (como vem do cadastro) formatado em BRL no idioma ativo. */
export function formatPlanAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(amount);
}

export function formatBillingDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'America/Fortaleza',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
