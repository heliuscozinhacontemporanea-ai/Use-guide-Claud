import { PROMO_MAX_PERCENT, type PromoCode } from '../types/promoCode';

export interface PromoLine {
  optionId: string;
  unitPriceMinor: number;
  quantity: number;
}

/**
 * Desconto de cada linha do pedido, em centavos. Porcentagem: por ingresso, só nos `maxTicketsPerOrder`
 * primeiros que valem. Valor fixo: uma vez por pedido, dividido entre as linhas que valem. Nunca passa de
 * 90% do valor das linhas com desconto (ingresso grátis só por cortesia).
 */
export function computePromoDiscount(
  promo: Pick<PromoCode, 'type' | 'percentage' | 'valueMinor' | 'maxTicketsPerOrder'>,
  optionIds: string[] | null,
  lines: PromoLine[]
): number[] {
  const eligible = lines.map((line) => !optionIds || optionIds.includes(line.optionId));
  if (promo.type === 'percentage') {
    const percent = Math.min(promo.percentage ?? 0, PROMO_MAX_PERCENT);
    let remaining = promo.maxTicketsPerOrder ?? Number.POSITIVE_INFINITY;
    return lines.map((line, index) => {
      if (!eligible[index] || remaining <= 0) return 0;
      const tickets = Math.min(line.quantity, remaining);
      remaining -= tickets;
      return tickets * Math.floor((line.unitPriceMinor * percent) / 100);
    });
  }

  const subtotals = lines.map((line, index) =>
    eligible[index] ? line.unitPriceMinor * line.quantity : 0
  );
  const eligibleSubtotal = subtotals.reduce((sum, value) => sum + value, 0);
  const total = Math.min(
    promo.valueMinor ?? 0,
    Math.floor((eligibleSubtotal * PROMO_MAX_PERCENT) / 100)
  );
  if (total <= 0) return lines.map(() => 0);
  const lastEligible = subtotals.findLastIndex((value) => value > 0);
  let allocated = 0;
  return subtotals.map((subtotal, index) => {
    if (subtotal === 0) return 0;
    if (index === lastEligible) return total - allocated;
    const share = Math.floor((total * subtotal) / eligibleSubtotal);
    allocated += share;
    return share;
  });
}
