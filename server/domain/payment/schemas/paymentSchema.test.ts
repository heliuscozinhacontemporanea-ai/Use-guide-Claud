import { describe, expect, it } from 'vitest';
import {
  CreatePlanPaymentIntentSchema,
  CreateTicketPaymentIntentSchema,
} from './paymentSchema';

describe('Payment Schemas - Mass Assignment Protection and Strictness', () => {
  const validPlanPayload = {
    planId: 'plan-premium',
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

  it('rejeita campos extras em CreateTicketPaymentIntentSchema', () => {
    const maliciousTicketPayload = {
      orderId: 'ord-123',
      idempotencyKey: 'idemp-ticket-12345',
      totalMinor: 100,
      platformFeeMinor: 0,
    };
    const result = CreateTicketPaymentIntentSchema.safeParse(maliciousTicketPayload);
    expect(result.success).toBe(false);
  });
});
