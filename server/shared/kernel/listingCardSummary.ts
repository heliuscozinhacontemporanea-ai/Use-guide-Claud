/** Unidade do "a partir de" no cartão de vitrine (D37 item 10). */
export type CardPriceUnit = 'person' | 'group' | 'vehicle' | 'hour' | 'ticket';

/**
 * Resumo do cartão de vitrine (D37 item 10, DESIGN.md §8), gravado pelo servidor no anúncio e no evento
 * publicados. Classe pública (§7.6): é o preço exibido. No ingresso, o valor já tem a taxa de serviço
 * paga pelo comprador (D14) e `serviceFeeIncluded` liga a linha "taxa de serviço inclusa".
 */
export interface ListingCardSummary {
  fromPriceMinor: number;
  priceUnit: CardPriceUnit;
  serviceFeeIncluded: boolean;
  durationMinutes?: number;
  freeCancellationHours?: number;
}

/** O resumo da opção mais barata; empate fica com a primeira (a ordem que o parceiro cadastrou). */
export function cheapestCardSummary(
  candidates: readonly ListingCardSummary[]
): ListingCardSummary | null {
  let best: ListingCardSummary | null = null;
  for (const candidate of candidates) {
    if (!best || candidate.fromPriceMinor < best.fromPriceMinor) best = candidate;
  }
  return best;
}

/** Confere o resumo antes de gravar: dinheiro em centavos inteiros e prazos inteiros (§1, §8.5). */
export function isValidCardSummary(summary: ListingCardSummary): boolean {
  const whole = (value: number | undefined) =>
    value === undefined || (Number.isSafeInteger(value) && value >= 0);
  return (
    Number.isSafeInteger(summary.fromPriceMinor) &&
    summary.fromPriceMinor >= 0 &&
    whole(summary.durationMinutes) &&
    whole(summary.freeCancellationHours)
  );
}
