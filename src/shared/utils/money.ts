/** Centavos (MoneyMinor) → BRL no idioma ativo. A moeda é sempre BRL (AGENTS.md §1, §12.4). */
export function formatMoneyMinor(amountMinor: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    amountMinor / 100
  );
}

/** Como `formatMoneyMinor`, mas sem ",00" quando o valor é inteiro em reais (cartões do painel, D27). */
export function formatMoneyMinorCompact(amountMinor: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
  }).format(amountMinor / 100);
}
