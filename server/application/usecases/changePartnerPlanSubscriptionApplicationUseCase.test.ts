import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ assertPurchasable: vi.fn(), schedule: vi.fn(), getPlan: vi.fn() }));

vi.mock('../../domain/admin', () => ({ getSubscriptionPlanByIdUseCase: m.getPlan }));
vi.mock('../../domain/partners', () => ({
  isPaidListingPlanType: (value: string) =>
    value === 'monthly' || value === 'semi-annual' || value === 'annual',
}));
vi.mock('../../domain/payment', async () => {
  const { PaymentDomainError } = await import('../../domain/payment/services/stripePaymentService');
  return { PaymentDomainError, schedulePlanSubscriptionChangeUseCase: m.schedule };
});
vi.mock('./listingPlans/assertListingPlanPurchasableApplicationUseCase', () => ({
  assertListingPlanPurchasableApplicationUseCase: m.assertPurchasable,
}));

import { changePartnerPlanSubscriptionApplicationUseCase } from './changePartnerPlanSubscriptionApplicationUseCase';

const ACTOR = { uid: 'p1' };
const INPUT = { itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345' };

describe('changePartnerPlanSubscriptionApplicationUseCase (D13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.assertPurchasable.mockResolvedValue({ currentPlanUntil: null });
    m.getPlan.mockResolvedValue({ id: 'annual', name: 'Anual', priceMinor: 49900, isActive: true });
    m.schedule.mockResolvedValue({ pendingPlanId: 'annual' });
  });

  it('valor e intervalo do catálogo; confere dono e verificação do estabelecimento', async () => {
    await changePartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT);
    expect(m.assertPurchasable).toHaveBeenCalledWith(ACTOR, 'item-1');
    expect(m.schedule).toHaveBeenCalledWith({
      itemId: 'item-1',
      partnerId: 'p1',
      planId: 'annual',
      planName: 'Anual',
      amountMinor: 49900,
      interval: 'year',
      intervalCount: 1,
      idempotencyKey: 'key-12345',
    });
  });

  it('plano inativo não troca', async () => {
    m.getPlan.mockResolvedValue({
      id: 'annual',
      name: 'Anual',
      priceMinor: 49900,
      isActive: false,
    });
    await expect(
      changePartnerPlanSubscriptionApplicationUseCase(ACTOR, INPUT)
    ).rejects.toMatchObject({ code: 'PLAN_INACTIVE' });
    expect(m.schedule).not.toHaveBeenCalled();
  });

  it('teste grátis não é período de cobrança', async () => {
    await expect(
      changePartnerPlanSubscriptionApplicationUseCase(ACTOR, { ...INPUT, planId: 'trial' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});
