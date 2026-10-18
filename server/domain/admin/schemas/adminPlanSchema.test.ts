import { describe, expect, it } from 'vitest';
import { updatePlanSchema } from './adminPlanSchema';

describe('updatePlanSchema', () => {
  it('aceita description e preço em centavos', () => {
    const result = updatePlanSchema.safeParse({
      name: 'Plano Anual',
      priceMinor: 29990,
      period: '/ano',
      description: 'Ideal para estabelecimentos de alta temporada',
      isActive: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe('Ideal para estabelecimentos de alta temporada');
      expect(result.data.priceMinor).toBe(29990);
    }
  });

  it('rejeita campo desconhecido (ex: ownerId, id, equivalente mensal, preço em reais)', () => {
    for (const extra of [
      { ownerId: 'hacker-1' },
      { id: 'annual' },
      { monthlyEquivalentMinor: 2500 },
      { price: 299.9 },
    ]) {
      expect(updatePlanSchema.safeParse({ name: 'Plano', ...extra }).success).toBe(false);
    }
  });

  it('rejeita corpo vazio', () => {
    expect(updatePlanSchema.safeParse({}).success).toBe(false);
  });

  it('rejeita preço com casas decimais, texto, NaN, Infinity e negativo', () => {
    for (const priceMinor of [
      299.9,
      '29990',
      Number.NaN,
      Number.POSITIVE_INFINITY,
      -10,
    ]) {
      expect(updatePlanSchema.safeParse({ priceMinor }).success).toBe(false);
    }
  });
});
