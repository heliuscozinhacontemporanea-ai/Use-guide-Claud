import { describe, expect, it } from 'vitest';
import { updatePlanSchema } from './adminPlanSchema';

describe('updatePlanSchema', () => {
  it('aceita description e campos válidos', () => {
    const result = updatePlanSchema.safeParse({
      name: 'Plano Anual',
      price: 299.9,
      period: '/ano',
      description: 'Ideal para estabelecimentos de alta temporada',
      isActive: true,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe(
        'Ideal para estabelecimentos de alta temporada'
      );
      expect(result.data.price).toBe(299.9);
    }
  });

  it('rejeita campo desconhecido (ex: ownerId, id, monthlyEquivalent)', () => {
    expect(
      updatePlanSchema.safeParse({
        name: 'Plano',
        ownerId: 'hacker-1',
      }).success
    ).toBe(false);

    expect(
      updatePlanSchema.safeParse({
        name: 'Plano',
        id: 'annual',
      }).success
    ).toBe(false);

    expect(
      updatePlanSchema.safeParse({
        name: 'Plano',
        monthlyEquivalent: 25,
      }).success
    ).toBe(false);
  });

  it('rejeita corpo vazio', () => {
    expect(updatePlanSchema.safeParse({}).success).toBe(false);
  });

  it('rejeita price inválido, NaN, Infinity e negativo', () => {
    expect(
      updatePlanSchema.safeParse({
        price: 'abc',
      }).success
    ).toBe(false);

    expect(
      updatePlanSchema.safeParse({
        price: Number.NaN,
      }).success
    ).toBe(false);

    expect(
      updatePlanSchema.safeParse({
        price: Number.POSITIVE_INFINITY,
      }).success
    ).toBe(false);

    expect(
      updatePlanSchema.safeParse({
        price: -10,
      }).success
    ).toBe(false);
  });
});
