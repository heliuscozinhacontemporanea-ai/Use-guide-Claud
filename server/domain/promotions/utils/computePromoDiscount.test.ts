import { describe, expect, it } from 'vitest';
import { computePromoDiscount } from './computePromoDiscount';

const lines = [
  { optionId: 'pista', unitPriceMinor: 10000, quantity: 3 },
  { optionId: 'vip', unitPriceMinor: 30000, quantity: 1 },
];

describe('computePromoDiscount', () => {
  it('porcentagem: por ingresso, só nos lotes escolhidos', () => {
    const promo = {
      type: 'percentage' as const,
      percentage: 10,
      valueMinor: null,
      maxTicketsPerOrder: null,
    };
    expect(computePromoDiscount(promo, null, lines)).toEqual([3000, 3000]);
    expect(computePromoDiscount(promo, ['vip'], lines)).toEqual([0, 3000]);
  });

  it('porcentagem: só os N primeiros ingressos que valem levam desconto', () => {
    const promo = {
      type: 'percentage' as const,
      percentage: 50,
      valueMinor: null,
      maxTicketsPerOrder: 2,
    };
    expect(computePromoDiscount(promo, null, lines)).toEqual([10000, 0]);
  });

  it('valor fixo: uma vez por pedido, dividido entre as linhas que valem', () => {
    const promo = {
      type: 'fixed' as const,
      percentage: null,
      valueMinor: 1000,
      maxTicketsPerOrder: null,
    };
    const discounts = computePromoDiscount(promo, null, lines);
    expect(discounts.reduce((sum, value) => sum + value, 0)).toBe(1000);
    expect(discounts).toEqual([500, 500]);
    expect(computePromoDiscount(promo, ['pista'], lines)).toEqual([1000, 0]);
  });

  it('nunca passa de 90% do valor com desconto (ingresso grátis só por cortesia)', () => {
    const fixed = {
      type: 'fixed' as const,
      percentage: null,
      valueMinor: 999_999,
      maxTicketsPerOrder: null,
    };
    expect(computePromoDiscount(fixed, ['vip'], lines)).toEqual([0, 27000]);
    const percent = {
      type: 'percentage' as const,
      percentage: 100,
      valueMinor: null,
      maxTicketsPerOrder: null,
    };
    expect(computePromoDiscount(percent, ['vip'], lines)).toEqual([0, 27000]);
  });
});
