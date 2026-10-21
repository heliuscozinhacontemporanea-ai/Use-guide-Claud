import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/admin', () => ({ getSubscriptionPlanByIdUseCase: vi.fn() }));
vi.mock('../../domain/partners', () => ({
  getPartnerProfileUseCase: vi.fn(),
  isPaidListingPlanType: (value: string) =>
    value === 'monthly' || value === 'semi-annual' || value === 'annual',
}));
vi.mock('../../domain/payment', async () => {
  const { PaymentDomainError } = await import('../../domain/payment/services/stripePaymentService');
  return { PaymentDomainError, startPlanSubscriptionUseCase: vi.fn().mockResolvedValue({}) };
});

import { getSubscriptionPlanByIdUseCase } from '../../domain/admin';
import { getPartnerProfileUseCase } from '../../domain/partners';
import { startPlanSubscriptionUseCase } from '../../domain/payment';
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
  beforeEach(() => vi.clearAllMocks());

  it('recusa plano que não é pago', async () => {
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
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
        planId: 'semi-annual',
        locale: 'pt-BR',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toMatchObject({ code: 'PLAN_INACTIVE' });
  });

  it('recusa usuário sem cadastro de parceiro', async () => {
    mockPlan();
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue(null as never);
    await expect(
      startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
        planId: 'semi-annual',
        locale: 'pt-BR',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
  });

  it('calcula o valor em centavos e o intervalo no backend', async () => {
    mockPlan();
    vi.mocked(getPartnerProfileUseCase).mockResolvedValue({
      verifiedUntil: '2026-12-01T00:00:00.000Z',
    } as never);
    await startPartnerPlanSubscriptionApplicationUseCase(ACTOR, {
      planId: 'semi-annual',
      locale: 'en',
      idempotencyKey: 'key-12345',
    });
    expect(startPlanSubscriptionUseCase).toHaveBeenCalledWith({
      partnerId: 'p1',
      email: 'p1@example.com',
      locale: 'en',
      planId: 'semi-annual',
      planName: 'Semestral',
      amountMinor: 24990,
      interval: 'month',
      intervalCount: 6,
      currentVerifiedUntil: null,
      idempotencyKey: 'key-12345',
    });
  });
});
