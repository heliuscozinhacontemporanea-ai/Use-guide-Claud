import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../domain/payment', () => ({ syncPlanSubscriptionUseCase: vi.fn() }));
vi.mock('../../domain/notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./activatePaidPlanApplicationUseCase', () => ({
  activatePaidPlanApplicationUseCase: vi.fn().mockResolvedValue({ verifiedUntil: 'x' }),
}));

import { createNotificationUseCase } from '../../domain/notifications';
import { syncPlanSubscriptionUseCase } from '../../domain/payment';
import { activatePaidPlanApplicationUseCase } from './activatePaidPlanApplicationUseCase';
import {
  readInvoiceSubscriptionId,
  reconcilePlanSubscriptionWebhookApplicationUseCase,
} from './reconcilePlanSubscriptionWebhookApplicationUseCase';

const PLAN_SNAPSHOT = {
  subscriptionId: 'sub_1',
  customerId: 'cus_1',
  status: 'active' as const,
  currentPeriodEnd: '2026-11-10T12:00:00.000Z',
  cancelAtPeriodEnd: false,
  metadata: {
    referenceType: 'plan_subscription',
    partnerId: 'p1',
    planId: 'monthly',
    itemId: 'item-1',
  },
};

function invoiceEvent(type: string) {
  return {
    id: 'evt_1',
    type,
    created: 0,
    dataObject: { id: 'in_1', parent: { subscription_details: { subscription: 'sub_1' } } },
  };
}

describe('readInvoiceSubscriptionId', () => {
  it('lê o ID de parent.subscription_details', () => {
    expect(readInvoiceSubscriptionId(invoiceEvent('invoice.paid').dataObject)).toBe('sub_1');
  });

  it('aceita a assinatura expandida', () => {
    expect(
      readInvoiceSubscriptionId({
        parent: { subscription_details: { subscription: { id: 'sub_2' } } },
      })
    ).toBe('sub_2');
  });

  it('fatura sem assinatura → null', () => {
    expect(readInvoiceSubscriptionId({ parent: null })).toBeNull();
    expect(readInvoiceSubscriptionId({})).toBeNull();
  });
});

describe('reconcilePlanSubscriptionWebhookApplicationUseCase', () => {
  beforeEach(() => vi.clearAllMocks());

  it('invoice.paid ativa o plano até o fim do período relido no Stripe', async () => {
    vi.mocked(syncPlanSubscriptionUseCase).mockResolvedValue(PLAN_SNAPSHOT);
    await reconcilePlanSubscriptionWebhookApplicationUseCase(invoiceEvent('invoice.paid'));
    expect(syncPlanSubscriptionUseCase).toHaveBeenCalledWith('sub_1');
    expect(activatePaidPlanApplicationUseCase).toHaveBeenCalledWith({
      itemId: 'item-1',
      partnerId: 'p1',
      planId: 'monthly',
      paymentReference: 'in_1',
      subscriptionPeriodEnd: '2026-11-10T12:00:00.000Z',
    });
  });

  it('invoice.payment_failed notifica o parceiro e não ativa o plano', async () => {
    vi.mocked(syncPlanSubscriptionUseCase).mockResolvedValue({
      ...PLAN_SNAPSHOT,
      status: 'past_due',
    });
    await reconcilePlanSubscriptionWebhookApplicationUseCase(
      invoiceEvent('invoice.payment_failed')
    );
    expect(activatePaidPlanApplicationUseCase).not.toHaveBeenCalled();
    expect(createNotificationUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ recipientPartnerId: 'p1' })
    );
  });

  it('ignora fatura de assinatura que não é de plano', async () => {
    vi.mocked(syncPlanSubscriptionUseCase).mockResolvedValue({ ...PLAN_SNAPSHOT, metadata: {} });
    await reconcilePlanSubscriptionWebhookApplicationUseCase(invoiceEvent('invoice.paid'));
    expect(activatePaidPlanApplicationUseCase).not.toHaveBeenCalled();
  });

  it('customer.subscription.deleted só sincroniza o registro', async () => {
    vi.mocked(syncPlanSubscriptionUseCase).mockResolvedValue({
      ...PLAN_SNAPSHOT,
      status: 'canceled',
    });
    await reconcilePlanSubscriptionWebhookApplicationUseCase({
      id: 'evt_2',
      type: 'customer.subscription.deleted',
      created: 0,
      dataObject: { id: 'sub_1' },
    });
    expect(syncPlanSubscriptionUseCase).toHaveBeenCalledWith('sub_1');
    expect(activatePaidPlanApplicationUseCase).not.toHaveBeenCalled();
  });

  it('falha ao sincronizar propaga o erro para o webhook responder 5xx e o Stripe reenviar', async () => {
    vi.mocked(syncPlanSubscriptionUseCase).mockRejectedValue(new Error('stripe down'));
    await expect(
      reconcilePlanSubscriptionWebhookApplicationUseCase(invoiceEvent('invoice.paid'))
    ).rejects.toThrow('stripe down');
  });
});
