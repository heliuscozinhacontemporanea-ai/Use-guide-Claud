import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  assertListingPlanPurchasableApplicationUseCase: vi.fn(),
}));

import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
import { PaymentDomainError, startPlanSubscriptionUseCase } from '../../domain/payment';
import { assertListingPlanPurchasableApplicationUseCase } from './listingPlans/assertListingPlanPurchasableApplicationUseCase';
import { startPartnerPlanSubscriptionApplicationUseCase } from './startPartnerPlanSubscriptionApplicationUseCase';

const ACTOR = { uid: 'p1', email: 'p1@example.com' };

function mockPlan(overrides: Record<string, unknown> = {}) {
  vi.mocked(getSubscriptionPlanByIdUseCase).mockResolvedValue({
    id: 'semi-annual',
    name: 'Semestral',
    priceMinor: 24990,
    isActive: true,
    ...overrides,
  } as never);
}

describe('startPartnerPlanSubscriptionApplicationUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockResolvedValue({
      currentPaidUntil: null,
    });
  });

  it('recusa plano que não é pago', async () => {
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
        itemId: 'item-1',
        planId: 'trial',
        locale: 'pt-BR',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('recusa plano inativo', async () => {
    mockPlan({ isActive: false });
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
        itemId: 'item-1',
        planId: 'semi-annual',
        locale: 'pt-BR',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toMatchObject({ code: 'PLAN_INACTIVE' });
  });

  it('recusa estabelecimento sem documento aprovado ou de outro dono', async () => {
    mockPlan();
    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockRejectedValueOnce(
      new PaymentDomainError('VERIFICATION_REQUIRED', 'Precisa verificar.', 422)
    );
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
        itemId: 'item-1',
        planId: 'semi-annual',
        locale: 'pt-BR',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toMatchObject({ code: 'VERIFICATION_REQUIRED', statusCode: 422 });
  });

  it('calcula o valor em centavos, o intervalo e reaproveita o período pago do estabelecimento', async () => {
    mockPlan();
    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockResolvedValue({
      currentPaidUntil: '2026-12-01T00:00:00.000Z',
    });
    await startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
      itemId: 'item-1',
      planId: 'semi-annual',
      locale: 'en',
      idempotencyKey: 'key-12345',
    });
    expect(assertListingPlanPurchasableApplicationUseCase).toHaveBeenCalledWith('p1', 'item-1');
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
