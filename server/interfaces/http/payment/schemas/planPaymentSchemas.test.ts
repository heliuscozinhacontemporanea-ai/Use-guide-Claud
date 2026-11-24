import { describe, expect, it } from 'vitest';
import { CreatePlanPaymentIntentSchema } from './planPaymentSchemas';

describe('Payment Schemas - Mass Assignment Protection and Strictness', () => {
  const validPlanPayload = {
    itemId: 'item-1',
    planId: 'monthly',
    idempotencyKey: 'idemp-key-12345',
  };

  it('valida com sucesso payload correto para criação de PaymentIntent de plano', () => {
    const result = CreatePlanPaymentIntentSchema.safeParse(validPlanPayload);
    expect(result.success).toBe(true);
  });

  it('rejeita injeção de amount arbitrário (prevenção contra manipulação de preço)', () => {
    const maliciousPayload = {
      ...validPlanPayload,
      amount: 0.01,
    };
    const result = CreatePlanPaymentIntentSchema.safeParse(maliciousPayload);
    expect(result.success).toBe(false);
  });

  it('rejeita injeção de campos administrativos como status, role, isAdmin', () => {
    const maliciousPayload = {
      ...validPlanPayload,
      status: 'succeeded',
      isAdmin: true,
      role: 'admin',
    };
    const result = CreatePlanPaymentIntentSchema.safeParse(maliciousPayload);
    expect(result.success).toBe(false);
  });
});
