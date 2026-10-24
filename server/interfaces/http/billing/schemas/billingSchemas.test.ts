import { describe, expect, it } from 'vitest';
import { BillingPortalSchema, StartPlanSubscriptionSchema } from './billingSchemas';

describe('StartPlanSubscriptionSchema', () => {
  const valid = { itemId: 'item-1', planId: 'annual', locale: 'fr', idempotencyKey: 'key-12345' };

  it('aceita entrada válida', () => {
    expect(StartPlanSubscriptionSchema.safeParse(valid).success).toBe(true);
  });

  it('recusa plano gratuito, idioma fora da lista e chave curta', () => {
    expect(StartPlanSubscriptionSchema.safeParse({ ...valid, planId: 'trial' }).success).toBe(
      false
    );
    expect(StartPlanSubscriptionSchema.safeParse({ ...valid, locale: 'es' }).success).toBe(false);
    expect(StartPlanSubscriptionSchema.safeParse({ ...valid, idempotencyKey: 'abc' }).success).toBe(
      false
    );
  });

  it('recusa campos extras como preço ou parceiro vindos do cliente', () => {
    expect(StartPlanSubscriptionSchema.safeParse({ ...valid, amountMinor: 1 }).success).toBe(false);
    expect(StartPlanSubscriptionSchema.safeParse({ ...valid, partnerId: 'outro' }).success).toBe(
      false
    );
  });
});

describe('BillingPortalSchema', () => {
  it('exige idioma suportado e nada mais', () => {
    expect(BillingPortalSchema.safeParse({ locale: 'pt-BR' }).success).toBe(true);
    expect(
      BillingPortalSchema.safeParse({ locale: 'pt-BR', returnUrl: 'https://evil' }).success
    ).toBe(false);
  });
});
