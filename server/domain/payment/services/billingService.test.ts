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
    cancelNow: vi.fn().mockResolvedValue({
      subscriptionId: 'sub_1',
      customerId: 'cus_1',
      status: 'canceled',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      scheduleId: null,
      metadata: {},
    }),
    schedulePriceChange: vi.fn(),
    releaseSchedule: vi.fn(),
    createBillingPortalSession: vi.fn().mockResolvedValue({ url: 'https://billing.stripe.com/x' }),
    ...overrides,
  };
}

function createRepository(
  record: PlanSubscriptionRecord | null = null,
  byPartner: PlanSubscriptionRecord[] = record ? [record] : []
): PlanSubscriptionRepositoryPort {
  return {
    get: vi.fn().mockResolvedValue(record),
    save: vi.fn().mockResolvedValue(undefined),
    listByPartner: vi.fn().mockResolvedValue(byPartner),
  };
}

function buildRecord(overrides: Partial<PlanSubscriptionRecord> = {}): PlanSubscriptionRecord {
  return {
    itemId: 'item-1',
    partnerId: 'p1',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    planId: 'monthly',
    status: 'active',
    currentPeriodEnd: '2026-11-10T12:00:00.000Z',
    cancelAtPeriodEnd: false,
    pendingPlanId: null,
    pendingChangeAt: null,
    updatedAt: '2026-10-10T12:00:00.000Z',
    ...overrides,
  };
}

function buildInput(
  overrides: Partial<StartPlanSubscriptionInput> = {}
): StartPlanSubscriptionInput {
  return {
    itemId: 'item-1',
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
    scheduleId: null,
    metadata: {
      referenceType: 'plan_subscription',
      partnerId: 'p1',
      planId: 'monthly',
      itemId: 'item-1',
    },
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

  it('usa lookupKey por plano e valor, metadata só com IDs e chave idempotente do estabelecimento', async () => {
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
      metadata: {
        referenceType: 'plan_subscription',
        partnerId: 'p1',
        planId: 'monthly',
        itemId: 'item-1',
      },
      idempotencyKey: 'sub_item-1_key-12345',
    });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: 'item-1',
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

  it('ignora assinatura sem partnerId ou itemId na metadata', async () => {
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
    await expect(service.setCancelAtPeriodEnd('item-1', 'p1', true)).rejects.toMatchObject({
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
      'item-1',
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

  it('assinatura de outra conta é tratada como inexistente', async () => {
    const service = new BillingService(createGateway(), createRepository(buildRecord()), () => NOW);
    expect(await service.getListingSubscription('item-1', 'intruso')).toBeNull();
    await expect(service.setCancelAtPeriodEnd('item-1', 'intruso', true)).rejects.toMatchObject({
      code: 'SUBSCRIPTION_NOT_FOUND',
    });
  });
});

describe('BillingService: um cliente por conta e cancelamento nas exclusões (B24)', () => {
  it('estabelecimento novo reaproveita o cliente Stripe da conta', async () => {
    const gateway = createGateway();
    const repository = createRepository(null, [buildRecord({ itemId: 'item-9' })]);
    await new BillingService(gateway, repository, () => NOW).startPlanSubscription(buildInput());
    expect(gateway.ensureCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ existingCustomerId: 'cus_1', partnerId: 'p1' })
    );
  });

  it('excluir o estabelecimento cancela na hora só a assinatura viva dele', async () => {
    const gateway = createGateway();
    const repository = createRepository(buildRecord());
    await new BillingService(gateway, repository, () => NOW).cancelForListing('item-1');
    expect(gateway.cancelNow).toHaveBeenCalledWith('sub_1');
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'canceled' }));
  });

  it('excluir a conta cancela todas as assinaturas vivas e ignora as encerradas', async () => {
    const gateway = createGateway();
    const repository = createRepository(null, [
      buildRecord({ itemId: 'item-1', stripeSubscriptionId: 'sub_1' }),
      buildRecord({ itemId: 'item-2', stripeSubscriptionId: 'sub_2', status: 'canceled' }),
    ]);
    await new BillingService(gateway, repository, () => NOW).cancelForPartner('p1');
    expect(gateway.cancelNow).toHaveBeenCalledTimes(1);
    expect(gateway.cancelNow).toHaveBeenCalledWith('sub_1');
  });
});

describe('BillingService.schedulePlanChange (D13)', () => {
  const CHANGE = {
    itemId: 'item-1',
    partnerId: 'p1',
    planId: 'annual',
    planName: 'Anual',
    amountMinor: 49900,
    interval: 'year' as const,
    intervalCount: 1,
    idempotencyKey: 'key-12345',
  };

  it('agenda o novo preço para a renovação, com a metadata do plano novo', async () => {
    const repository = createRepository(buildRecord());
    const gateway = createGateway({
      ensureRecurringPrice: vi.fn().mockResolvedValue('price_annual'),
      schedulePriceChange: vi.fn().mockResolvedValue(snapshot({ scheduleId: 'sub_sched_1' })),
    });
    const record = await new BillingService(gateway, repository, () => NOW).schedulePlanChange(
      CHANGE
    );
    expect(gateway.ensureRecurringPrice).toHaveBeenCalledWith(
      expect.objectContaining({
        lookupKey: 'plan_annual_49900',
        interval: 'year',
        intervalCount: 1,
      })
    );
    expect(gateway.schedulePriceChange).toHaveBeenCalledWith({
      subscriptionId: 'sub_1',
      priceId: 'price_annual',
      metadata: {
        referenceType: 'plan_subscription',
        partnerId: 'p1',
        planId: 'annual',
        itemId: 'item-1',
      },
      idempotencyKey: 'sub_change_item-1_key-12345',
    });
    expect(record).toMatchObject({
      planId: 'monthly',
      pendingPlanId: 'annual',
      pendingChangeAt: '2026-11-10T12:00:00.000Z',
    });
    expect(repository.save).toHaveBeenCalledWith(record);
  });

  it('escolher o período atual desfaz a troca agendada', async () => {
    const repository = createRepository(buildRecord({ pendingPlanId: 'annual' }));
    const gateway = createGateway({ releaseSchedule: vi.fn().mockResolvedValue(snapshot()) });
    const record = await new BillingService(gateway, repository, () => NOW).schedulePlanChange({
      ...CHANGE,
      planId: 'monthly',
    });
    expect(gateway.releaseSchedule).toHaveBeenCalledWith('sub_1');
    expect(gateway.schedulePriceChange).not.toHaveBeenCalled();
    expect(record.pendingPlanId).toBeNull();
  });

  it('com a renovação cancelada, a troca retoma a renovação', async () => {
    const repository = createRepository(buildRecord({ cancelAtPeriodEnd: true }));
    const gateway = createGateway({
      setCancelAtPeriodEnd: vi.fn().mockResolvedValue(snapshot()),
      schedulePriceChange: vi.fn().mockResolvedValue(snapshot({ scheduleId: 'sub_sched_1' })),
    });
    await new BillingService(gateway, repository, () => NOW).schedulePlanChange(CHANGE);
    expect(gateway.setCancelAtPeriodEnd).toHaveBeenCalledWith('sub_1', false);
  });

  it('pagamento atrasado ou assinatura de outra conta não trocam', async () => {
    const pastDue = new BillingService(
      createGateway(),
      createRepository(buildRecord({ status: 'past_due' })),
      () => NOW
    );
    await expect(pastDue.schedulePlanChange(CHANGE)).rejects.toMatchObject({
      code: 'SUBSCRIPTION_PAST_DUE',
      statusCode: 409,
    });
    const otherAccount = new BillingService(
      createGateway(),
      createRepository(buildRecord({ partnerId: 'p2' })),
      () => NOW
    );
    await expect(otherAccount.schedulePlanChange(CHANGE)).rejects.toMatchObject({
      code: 'SUBSCRIPTION_NOT_FOUND',
    });
  });

  it('a troca sai do registro quando o novo período entra ou o agendamento some', async () => {
    const repository = createRepository(
      buildRecord({ pendingPlanId: 'annual', pendingChangeAt: '2026-11-10T12:00:00.000Z' })
    );
    const applied = snapshot({
      scheduleId: null,
      metadata: { ...snapshot().metadata, planId: 'annual' },
    });
    const gateway = createGateway({ getSubscription: vi.fn().mockResolvedValue(applied) });
    await new BillingService(gateway, repository, () => NOW).syncSubscription('sub_1');
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'annual', pendingPlanId: null, pendingChangeAt: null })
    );
  });

  it('sync mantém a troca enquanto o agendamento existe', async () => {
    const repository = createRepository(
      buildRecord({ pendingPlanId: 'annual', pendingChangeAt: '2026-11-10T12:00:00.000Z' })
    );
    const gateway = createGateway({
      getSubscription: vi.fn().mockResolvedValue(snapshot({ scheduleId: 'sub_sched_1' })),
    });
    await new BillingService(gateway, repository, () => NOW).syncSubscription('sub_1');
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({ planId: 'monthly', pendingPlanId: 'annual' })
    );
  });
});
