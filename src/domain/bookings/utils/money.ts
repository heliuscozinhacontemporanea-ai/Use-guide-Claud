/** Formata centavos em BRL no idioma ativo (AGENTS.md §12.4). */
export function formatMinor(amountMinor: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(
    amountMinor / 100
  );
}

/**
 * Converte o valor digitado em reais ("150,90", "150.90", "1.234,56") em centavos inteiros.
 * Devolve null quando o texto não é um valor válido.
 */
export function parseReaisToMinor(input: string): number | null {
  const trimmed = input.trim().replace(/\s|R\$/g, '');
  if (
    !/^\d{1,3}([.,]?\d{3})*([.,]\d{1,2})?$/.test(trimmed) &&
    !/^\d+([.,]\d{1,2})?$/.test(trimmed)
  ) {
    return null;
  }
  const decimalMatch = /[.,](\d{1,2})$/.exec(trimmed);
  const integerPart = (decimalMatch ? trimmed.slice(0, decimalMatch.index) : trimmed).replace(
    /[.,]/g,
    ''
  );
  const decimals = decimalMatch ? decimalMatch[1]!.padEnd(2, '0') : '00';
  return Number(integerPart) * 100 + Number(decimals);
}

export function minorToReaisInput(amountMinor: number): string {
  return (amountMinor / 100).toFixed(2).replace('.', ',');
}
