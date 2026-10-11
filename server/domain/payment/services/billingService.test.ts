import { describe, expect, it, vi } from 'vitest';
import type { BillingGatewayPort, SubscriptionSnapshot } from '../ports/billingGatewayPort';
import type {
  PlanSubscriptionRecord,
  PlanSubscriptionRepositoryPort,
} from '../ports/planSubscriptionRepositoryPort';
import { BillingService, type StartPlanSubscriptionInput } from './billingService';
import { PaymentDomainError } from './stripePaymentService';

const NOW = new Date('2026-10-10T12:00:00.000Z');

function createGateway(overrides: Partial<BillingGatewayPort> = {}): BillingGatewayPort {
  return {
    ensureCustomer: vi.fn().mockResolvedValue('cus_1'),
    ensureRecurringPrice: vi.fn().mockResolvedValue('price_1'),
    createSubscription: vi.fn().mockResolvedValue({
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'incomplete',
      currentPeriodEnd: null,
      clientSecret: 'secret_1',
      intentType: 'payment',
    }),
    getSubscription: vi.fn(),
    setCancelAtPeriodEnd: vi.fn(),
    createBillingPortalSession: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/x' }),
    ...overrides,
  };
}

function createRepository(
  record: PlanSubscriptionRecord | null = null
): PlanSubscriptionRepositoryPort {
  return { get: vi.fn().mockResolvedValue(record), save: vi.fn().mockResolvedValue(undefined) };
}

function buildRecord(overrides: Partial<PlanSubscriptionRecord> = {}): PlanSubscriptionRecord {
  return {
    partnerId: 'p1',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    planId: 'monthly',
    status: 'active',
    currentPeriodEnd: '2026-11-10T12:00:00.000Z',
    cancelAtPeriodEnd: false,
    updatedAt: '2026-10-10T12:00:00.000Z',
    ...overrides,
  };
}

function buildInput(
  overrides: Partial<StartPlanSubscriptionInput> = {}
): StartPlanSubscriptionInput {
  return {
    partnerId: 'p1',
    email: 'parceiro@example.com',
    locale: 'pt-BR',
    planId: 'monthly',
    planName: 'Mensal',
    amountMinor: 4990,
    interval: 'month',
    intervalCount: 1,
    currentVerifiedUntil: null,
    idempotencyKey: 'key-12345',
    ...overrides,
  };
}

function snapshot(overrides: Partial<SubscriptionSnapshot> = {}): SubscriptionSnapshot {
  return {
    subscriptionId: 'sub_1',
    customerId: 'cus_1',
    status: 'active',
    currentPeriodEnd: '2026-11-10T12:00:00.000Z',
    cancelAtPeriodEnd: false,
    metadata: { referenceType: 'plan_subscription', partnerId: 'p1', planId: 'monthly' },
    ...overrides,
  };
}

describe('BillingService.startPlanSubscription', () => {
  it('recusa com 409 quando já existe assinatura ativa', async () => {
    const service = new BillingService(createGateway(), createRepository(buildRecord()), () => NOW);
    await expect(service.startPlanSubscription(buildInput())).rejects.toMatchObject({
      code: 'SUBSCRIPTION_ALREADY_ACTIVE',
      statusCode: 409,
    });
  });

  it('permite nova tentativa quando a anterior ficou incompleta e reaproveita o cliente', async () => {
    const gateway = createGateway();
    const service = new BillingService(
      gateway,
      createRepository(buildRecord({ status: 'incomplete_expired' })),
      () => NOW
    );
    await service.startPlanSubscription(buildInput());
    expect(gateway.ensureCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ existingCustomerId: 'cus_1' })
    );
  });

  it('usa lookupKey por plano e valor, metadata só com IDs e chave idempotente do parceiro', async () => {
    const gateway = createGateway();
    const repository = createRepository();
    const service = new BillingService(gateway, repository, () => NOW);
    const result = await service.startPlanSubscription(buildInput());

    expect(gateway.ensureRecurringPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        lookupKey: 'plan_monthly_4990',
        interval: 'month',
        intervalCount: 1,
      })
    );
    expect(gateway.createSubscription).toHaveBeenCalledWith({
      customerId: 'cus_1',
      priceId: 'price_1',
      trialEndUnixSeconds: null,
      metadata: { referenceType: 'plan_subscription', partnerId: 'p1', planId: 'monthly' },
      idempotencyKey: 'sub_p1_key-12345',
    });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        partnerId: 'p1',
        stripeSubscriptionId: 'sub_1',
        status: 'incomplete',
      })
    );
    expect(result).toEqual({
      subscriptionId: 'sub_1',
      status: 'incomplete',
      clientSecret: 'secret_1',
      intentType: 'payment',
    });
  });

  it('período já pago daqui a 30 dias vira trial_end (não cobra duas vezes)', async () => {
    const gateway = createGateway();
    const service = new BillingService(gateway, createRepository(), () => NOW);
    await service.startPlanSubscription(
      buildInput({ currentVerifiedUntil: '2026-11-09T12:00:00.000Z' })
    );
    expect(gateway.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        trialEndUnixSeconds: Math.floor(Date.parse('2026-11-09T12:00:00.000Z') / 1000),
      })
    );
  });

  it('período pago terminando em menos de 48 h cobra agora', async () => {
    const gateway = createGateway();
    const service = new BillingService(gateway, createRepository(), () => NOW);
    await service.startPlanSubscription(
      buildInput({ currentVerifiedUntil: '2026-10-11T12:00:00.000Z' })
    );
    expect(gateway.createSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ trialEndUnixSeconds: null })
    );
  });

  it('recusa valor não inteiro ou zero', async () => {
    const service = new BillingService(createGateway(), createRepository(), () => NOW);
    await expect(
      service.startPlanSubscription(buildInput({ amountMinor: 0 }))
    ).rejects.toBeInstanceOf(PaymentDomainError);
  });
});

describe('BillingService.syncSubscription', () => {
  it('grava o estado relido do provedor', async () => {
    const repository = createRepository(buildRecord({ status: 'incomplete' }));
    const gateway = createGateway({ getSubscription: vi.fn().mockResolvedValue(snapshot()) });
    const service = new BillingService(gateway, repository, () => NOW);
    await service.syncSubscription('sub_1');
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active', currentPeriodEnd: '2026-11-10T12:00:00.000Z' })
    );
  });

  it('tentativa antiga expirada não sobrescreve a assinatura vigente', async () => {
    const repository = createRepository(buildRecord({ stripeSubscriptionId: 'sub_new' }));
    const gateway = createGateway({
      getSubscription: vi
        .fn()
        .mockResolvedValue(snapshot({ subscriptionId: 'sub_old', status: 'incomplete_expired' })),
    });
    const service = new BillingService(gateway, repository, () => NOW);
    await service.syncSubscription('sub_old');
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('ignora assinatura sem partnerId na metadata', async () => {
    const repository = createRepository();
    const gateway = createGateway({
      getSubscription: vi.fn().mockResolvedValue(snapshot({ metadata: {} })),
    });
    await new BillingService(gateway, repository, () => NOW).syncSubscription('sub_x');
    expect(repository.save).not.toHaveBeenCalled();
  });
});

describe('BillingService.setCancelAtPeriodEnd e portal', () => {
  it('sem assinatura ativa → 404', async () => {
    const service = new BillingService(createGateway(), createRepository(), () => NOW);
    await expect(service.setCancelAtPeriodEnd('p1', true)).rejects.toMatchObject({
      code: 'SUBSCRIPTION_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('agenda o cancelamento na assinatura do próprio parceiro', async () => {
    const gateway = createGateway({
      setCancelAtPeriodEnd: vi.fn().mockResolvedValue(snapshot({ cancelAtPeriodEnd: true })),
    });
    const repository = createRepository(buildRecord());
    const record = await new BillingService(gateway, repository, () => NOW).setCancelAtPeriodEnd(
      'p1',
      true
    );
    expect(gateway.setCancelAtPeriodEnd).toHaveBeenCalledWith('sub_1', true);
    expect(record.cancelAtPeriodEnd).toBe(true);
  });

  it('portal usa o cliente do próprio parceiro', async () => {
    const gateway = createGateway();
    await new BillingService(
      gateway,
      createRepository(buildRecord()),
      () => NOW
    ).createPortalSession('p1', 'https://useguide.com.br/?partner=1', 'fr');
    expect(gateway.createBillingPortalSession).toHaveBeenCalledWith({
      customerId: 'cus_1',
      returnUrl: 'https://useguide.com.br/?partner=1',
      locale: 'fr',
    });
  });
});
