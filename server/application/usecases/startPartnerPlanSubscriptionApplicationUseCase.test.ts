import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ assertPurchasable: vi.fn() }));

vi.mock('../../domain/admin', () => ({ getSubscriptionPlanByIdUseCase: vi.fn() }));
vi.mock('../../domain/partners', () => ({
  isPaidListingPlanType: (value: string) =>
    value === 'monthly' || value === 'semi-annual' || value === 'annual',
}));
vi.mock('../../domain/payment', async () => {
  const { PaymentDomainError } = await import('../../domain/payment/services/stripePaymentService');
  return { PaymentDomainError, startPlanSubscriptionUseCase: vi.fn().mockResolvedValue({}) };
});
vi.mock('./listingPlans/assertListingPlanPurchasableApplicationUseCase', () => ({
  assertListingPlanPurchasableApplicationUseCase: m.assertPurchasable,
}));

import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
import { startPlanSubscriptionUseCase } from '../../domain/payment';
import { PaymentDomainError } from '../../domain/payment/services/stripePaymentService';
import { startPartnerPlanSubscriptionApplicationUseCase } from './startPartnerPlanSubscriptionApplicationUseCase';

const ACTOR = { uid: 'p1', email: 'p1@example.com' };
const INPUT = {
  itemId: 'item-1',
  planId: 'semi-annual',
  locale: 'pt-BR' as const,
  idempotencyKey: 'key-12345',
};

function mockPlan(overrides: Record<string, unknown> = {}) {
  vi.mocked(getSubscriptionPlanByIdUseCase).mockResolvedValue({
    id: 'semi-annual',
    name: 'Semestral',
    priceMinor: 24990,
    isActive: true,
    ...overrides,
  } as never);
}

describe('startPartnerPlanSubscriptionApplicationUseCase (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: null });
  });

  it('recusa plano que não é pago', async () => {
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, { ...INPUT, planId: 'trial' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('recusa plano inativo', async () => {
    mockPlan({ isActive: false });
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
    ).rejects.toMatchObject({ code: 'PLAN_INACTIVE' });
  });

  it('estabelecimento sem verificação não assina', async () => {
    mockPlan();
    m.assertPurchasable.mockRejectedValue(
      new PaymentDomainError('LISTING_PENDING_VERIFICATION', 'Verifique antes.', 422)
    );
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
    ).rejects.toMatchObject({ code: 'LISTING_PENDING_VERIFICATION', statusCode: 422 });
    expect(startPlanSubscriptionUseCase).not.toHaveBeenCalled();
  });

  it('valor e intervalo no backend; período já pago do estabelecimento vira teste', async () => {
    mockPlan();
    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: '2026-12-01T00:00:00.000Z' });
    await startPartnerPlanSubscriptionApplicationUseCase(ACTOR, { ...INPUT, locale: 'en' });
    expect(m.assertPurchasable).toHaveBeenCalledWith(ACTOR, 'item-1');
    expect(startPlanSubscriptionUseCase).toHaveBeenCalledWith({
      itemId: 'item-1',
      partnerId: 'p1',
      email: 'p1@example.com',
      locale: 'en',
      planId: 'semi-annual',
      planName: 'Semestral',
      amountMinor: 24990,
      interval: 'month',
      intervalCount: 6,
      currentVerifiedUntil: '2026-12-01T00:00:00.000Z',
      idempotencyKey: 'key-12345',
    });
  });
});
