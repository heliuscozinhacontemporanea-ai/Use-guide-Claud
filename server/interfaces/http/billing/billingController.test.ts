import type { Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase', () => ({
  startPartnerPlanSubscriptionApplicationUseCase: vi.fn(),
}));
vi.mock('../../../application/usecases/changePartnerPlanSubscriptionApplicationUseCase', () => ({
  changePartnerPlanSubscriptionApplicationUseCase: vi.fn(),
}));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    createBillingPortalSessionUseCase: vi.fn(),
    getListingPlanSubscriptionUseCase: vi.fn(),
    setPlanSubscriptionCancelAtPeriodEndUseCase: vi.fn(),
  };
});

import { changePartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/changePartnerPlanSubscriptionApplicationUseCase';
import { startPartnerPlanSubscriptionApplicationUseCase } from '../../../application/usecases/startPartnerPlanSubscriptionApplicationUseCase';
import {
  createBillingPortalSessionUseCase,
  getListingPlanSubscriptionUseCase,
  PaymentDomainError,
} from '../../../domain/payment';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { BillingController } from './billingController';

function createResponse() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
}

function request(body: unknown, uid: string | null = 'p1', query: unknown = {}) {
  return {
    body,
    query,
    user: uid ? { uid, email: 'p1@example.com' } : undefined,
  } as AuthenticatedRequest;
}

const VALID_BODY = {
  itemId: 'item-1',
  planId: 'monthly',
  locale: 'pt-BR',
  idempotencyKey: 'key-12345',
};

describe('BillingController', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it('401 sem autenticação', async () => {
    const { res, status, json } = createResponse();
    await BillingController.startSubscription(request(VALID_BODY, null), res);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'UNAUTHENTICATED', message: 'Não autenticado.' },
    });
  });

  it('400 com corpo inválido', async () => {
    const { res, status, json } = createResponse();
    await BillingController.startSubscription(request({ ...VALID_BODY, amountMinor: 1 }), res);
    expect(status).toHaveBeenCalledWith(400);
    expect(json.mock.calls[0]?.[0]).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    expect(startPartnerPlanSubscriptionApplicationUseCase).not.toHaveBeenCalled();
  });

  it('201 com o segredo do Payment Element', async () => {
    vi.mocked(startPartnerPlanSubscriptionApplicationUseCase).mockResolvedValue({
      subscriptionId: 'sub_1',
      status: 'incomplete',
      clientSecret: 'secret',
      intentType: 'payment',
    });
    const { res, status, json } = createResponse();
    await BillingController.startSubscription(request(VALID_BODY), res);
    expect(startPartnerPlanSubscriptionApplicationUseCase).toHaveBeenCalledWith(
      { uid: 'p1', email: 'p1@example.com' },
      VALID_BODY
    );
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ clientSecret: 'secret' }));
  });

  it('erro de domínio mantém status e código', async () => {
    vi.mocked(startPartnerPlanSubscriptionApplicationUseCase).mockRejectedValue(
      new PaymentDomainError(
        'SUBSCRIPTION_ALREADY_ACTIVE',
        'Você já tem uma assinatura ativa.',
        409
      )
    );
    const { res, status, json } = createResponse();
    await BillingController.startSubscription(request(VALID_BODY), res);
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'SUBSCRIPTION_ALREADY_ACTIVE', message: 'Você já tem uma assinatura ativa.' },
    });
  });

  it('erro inesperado não vaza a mensagem interna', async () => {
    vi.mocked(startPartnerPlanSubscriptionApplicationUseCase).mockRejectedValue(
      new Error('sk_live_xxx invalid')
    );
    const { res, status, json } = createResponse();
    await BillingController.startSubscription(request(VALID_BODY), res);
    expect(status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('sk_live');
  });

  it('GET não devolve o ID do cliente no Stripe', async () => {
    vi.mocked(getListingPlanSubscriptionUseCase).mockResolvedValue({
      itemId: 'item-1',
      partnerId: 'p1',
      stripeCustomerId: 'cus_secret',
      stripeSubscriptionId: 'sub_1',
      planId: 'monthly',
      status: 'active',
      currentPeriodEnd: '2026-11-10T12:00:00.000Z',
      cancelAtPeriodEnd: false,
      pendingPlanId: 'annual',
      pendingChangeAt: '2026-11-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
    });
    const { res, status, json } = createResponse();
    await BillingController.getSubscription(request(undefined, 'p1', { itemId: 'item-1' }), res);
    expect(getListingPlanSubscriptionUseCase).toHaveBeenCalledWith('item-1', 'p1');
    expect(status).toHaveBeenCalledWith(200);
    const body = json.mock.calls[0]?.[0];
    expect(body).toEqual({
      subscription: {
        itemId: 'item-1',
        planId: 'monthly',
        status: 'active',
        currentPeriodEnd: '2026-11-10T12:00:00.000Z',
        cancelAtPeriodEnd: false,
        pendingPlanId: 'annual',
        pendingChangeAt: '2026-11-10T12:00:00.000Z',
      },
    });
    expect(JSON.stringify(body)).not.toContain('cus_secret');
  });

  it('GET sem itemId: 400', async () => {
    const { res, status } = createResponse();
    await BillingController.getSubscription(request(undefined), res);
    expect(status).toHaveBeenCalledWith(400);
    expect(getListingPlanSubscriptionUseCase).not.toHaveBeenCalled();
  });

  it('portal usa APP_URL do servidor, nunca do cliente', async () => {
    vi.stubEnv('APP_URL', 'https://useguide.com.br/');
    vi.mocked(createBillingPortalSessionUseCase).mockResolvedValue({
      url: 'https://billing.stripe.com/s',
    });
    const { res, status } = createResponse();
    await BillingController.createPortalSession(request({ locale: 'en' }), res);
    expect(createBillingPortalSessionUseCase).toHaveBeenCalledWith(
      'p1',
      'https://useguide.com.br/?partner=1',
      'en'
    );
    expect(status).toHaveBeenCalledWith(200);
  });

  it('portal sem APP_URL https → 503', async () => {
    vi.stubEnv('APP_URL', '');
    const { res, status } = createResponse();
    await BillingController.createPortalSession(request({ locale: 'en' }), res);
    expect(status).toHaveBeenCalledWith(503);
    expect(createBillingPortalSessionUseCase).not.toHaveBeenCalled();
  });

  it('troca de período: só itemId, período e chave; o valor vem do servidor (D13)', async () => {
    const { res, status } = createResponse();
    await BillingController.changePlan(
      request({ itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345', amountMinor: 1 }),
      res
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(changePartnerPlanSubscriptionApplicationUseCase).not.toHaveBeenCalled();
  });

  it('troca de período devolve a troca agendada sem o ID do cliente', async () => {
    vi.mocked(changePartnerPlanSubscriptionApplicationUseCase).mockResolvedValue({
      itemId: 'item-1',
      partnerId: 'p1',
      stripeCustomerId: 'cus_secret',
      stripeSubscriptionId: 'sub_1',
      planId: 'monthly',
      status: 'active',
      currentPeriodEnd: '2026-11-10T12:00:00.000Z',
      cancelAtPeriodEnd: false,
      pendingPlanId: 'annual',
      pendingChangeAt: '2026-11-10T12:00:00.000Z',
      updatedAt: '2026-10-10T12:00:00.000Z',
    });
    const { res, status, json } = createResponse();
    await BillingController.changePlan(
      request({ itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345' }),
      res
    );
    expect(changePartnerPlanSubscriptionApplicationUseCase).toHaveBeenCalledWith(
      { uid: 'p1' },
      { itemId: 'item-1', planId: 'annual', idempotencyKey: 'key-12345' }
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json.mock.calls[0]?.[0].subscription.pendingPlanId).toBe('annual');
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('cus_secret');
  });
});
