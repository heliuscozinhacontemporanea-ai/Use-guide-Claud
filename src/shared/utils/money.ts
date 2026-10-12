/** Centavos (MoneyMinor) → BRL no idioma ativo. A moeda é sempre BRL (AGENTS.md §1, §12.4). */
export function formatMoneyMinor(amountMinor: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    amountMinor / 100
  );
}
