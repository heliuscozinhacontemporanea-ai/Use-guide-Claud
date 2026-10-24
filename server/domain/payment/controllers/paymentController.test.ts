import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import { PaymentController } from './paymentController';
import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
import { assertListingPlanPurchasableApplicationUseCase } from '../../../application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase';
import { reconcileStripeWebhookEventApplicationUseCase } from '../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase';
import { claimStripeWebhookEventUseCase } from '../usecases/claimStripeWebhookEventUseCase';
import { completeStripeWebhookEventUseCase } from '../usecases/completeStripeWebhookEventUseCase';
import { constructStripeWebhookEventUseCase } from '../usecases/constructStripeWebhookEventUseCase';
import { createPlanPaymentIntentUseCase } from '../usecases/createPlanPaymentIntentUseCase';
import { releaseStripeWebhookEventUseCase } from '../usecases/releaseStripeWebhookEventUseCase';
import { retrievePaymentIntentUseCase } from '../usecases/retrievePaymentIntentUseCase';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

vi.mock('../../../application/usecases/getPlanForPaymentApplicationUseCase', () => ({
  getPlanForPaymentApplicationUseCase: vi.fn(),
}));
vi.mock(
  '../../../application/usecases/listingPlans/assertListingPlanPurchasableApplicationUseCase',
  () => ({ assertListingPlanPurchasableApplicationUseCase: vi.fn() })
);

vi.mock('../../../application/usecases/reconcileStripeWebhookEventApplicationUseCase', () => ({ reconcileStripeWebhookEventApplicationUseCase: vi.fn() }));

vi.mock('../usecases/createPlanPaymentIntentUseCase', () => ({ createPlanPaymentIntentUseCase: vi.fn() }));
vi.mock('../usecases/constructStripeWebhookEventUseCase', () => ({ constructStripeWebhookEventUseCase: vi.fn() }));
vi.mock('../usecases/claimStripeWebhookEventUseCase', () => ({ claimStripeWebhookEventUseCase: vi.fn() }));
vi.mock('../usecases/completeStripeWebhookEventUseCase', () => ({ completeStripeWebhookEventUseCase: vi.fn() }));
vi.mock('../usecases/releaseStripeWebhookEventUseCase', () => ({ releaseStripeWebhookEventUseCase: vi.fn() }));
vi.mock('../usecases/retrievePaymentIntentUseCase', () => ({ retrievePaymentIntentUseCase: vi.fn() }));

describe('PaymentController', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
  });

  it('rejects unauthenticated request with 401', async () => {
    req = {
      body: {},
    };

    await PaymentController.createPlanPaymentIntent(req as AuthenticatedRequest, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects invalid payload with 400', async () => {
    req = {
      user: {
        uid: 'user-123',
        email: 'user@example.com',
        admin: false,
        emailVerified: true,
        authTime: 1700000000,
      },
      body: {
        planId: '',
      },
    };

    await PaymentController.createPlanPaymentIntent(req as AuthenticatedRequest, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates plan PaymentIntent using plan price from backend in minor units', async () => {
    req = {
      user: {
        uid: 'user-123',
        email: 'user@example.com',
        admin: false,
        emailVerified: true,
        authTime: 1700000000,
      },
      body: {
        itemId: 'item-1',
        planId: 'monthly',
        idempotencyKey: 'unique-key-12345',
      },
    };

    vi.mocked(assertListingPlanPurchasableApplicationUseCase).mockResolvedValueOnce({
      currentPaidUntil: null,
    });
    vi.mocked(getPlanForPaymentApplicationUseCase).mockResolvedValueOnce({
      id: 'monthly',
      name: 'Plano Profissional',
      priceMinor: 9900,
      isActive: true,
    } as never);
    vi.mocked(createPlanPaymentIntentUseCase).mockResolvedValueOnce({
      paymentIntentId: 'pi_123',
      clientSecret: 'pi_123_secret_abc',
      status: 'pending',
      transactionId: 'pi_123',
    });

    await PaymentController.createPlanPaymentIntent(req as AuthenticatedRequest, res);

    expect(assertListingPlanPurchasableApplicationUseCase).toHaveBeenCalledWith(
      'user-123',
      'item-1'
    );
    expect(createPlanPaymentIntentUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        buyerId: 'user-123',
        itemId: 'item-1',
        planId: 'monthly',
        planName: 'Plano Profissional',
        amountMinor: 9900,
        idempotencyKey: 'unique-key-12345',
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentIntentId: 'pi_123',
        clientSecret: 'pi_123_secret_abc',
      })
    );
  });

  describe('stripeWebhook', () => {
    const sampleEvent = {
      id: 'evt_123',
      type: 'payment_intent.succeeded',
      created: 1700000000,
      dataObject: { id: 'pi_123' },
    };

    it('retorna 400 quando a assinatura está ausente', async () => {
      const webhookReq = {
        headers: {},
        body: Buffer.from('{}'),
      } as unknown as Request;

      await PaymentController.stripeWebhook(webhookReq, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('retorna 200 com duplicate: true quando claim for already_processed e não chama reconcile', async () => {
      const webhookReq = {
        headers: { 'stripe-signature': 'sig_valid' },
        body: Buffer.from('{}'),
      } as unknown as Request;

      vi.mocked(constructStripeWebhookEventUseCase).mockReturnValueOnce(sampleEvent);
      vi.mocked(claimStripeWebhookEventUseCase).mockResolvedValueOnce('already_processed');

      await PaymentController.stripeWebhook(webhookReq, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true, duplicate: true });
      expect(reconcileStripeWebhookEventApplicationUseCase).not.toHaveBeenCalled();
    });

    it('retorna 200 e chama completeStripeWebhookEventUseCase quando claim for claimed e reconcile suceder', async () => {
      const webhookReq = {
        headers: { 'stripe-signature': 'sig_valid' },
        body: Buffer.from('{}'),
      } as unknown as Request;

      vi.mocked(constructStripeWebhookEventUseCase).mockReturnValueOnce(sampleEvent);
      vi.mocked(claimStripeWebhookEventUseCase).mockResolvedValueOnce('claimed');
      vi.mocked(reconcileStripeWebhookEventApplicationUseCase).mockResolvedValueOnce({
        processed: true,
        eventType: sampleEvent.type,
      });
      vi.mocked(completeStripeWebhookEventUseCase).mockResolvedValueOnce();

      await PaymentController.stripeWebhook(webhookReq, res);

      expect(reconcileStripeWebhookEventApplicationUseCase).toHaveBeenCalledWith(sampleEvent);
      expect(completeStripeWebhookEventUseCase).toHaveBeenCalledWith('evt_123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('retorna 500, chama releaseStripeWebhookEventUseCase e não chama complete quando reconcile falha', async () => {
      const webhookReq = {
        headers: { 'stripe-signature': 'sig_valid' },
        body: Buffer.from('{}'),
      } as unknown as Request;

      vi.mocked(constructStripeWebhookEventUseCase).mockReturnValueOnce(sampleEvent);
      vi.mocked(claimStripeWebhookEventUseCase).mockResolvedValueOnce('claimed');
      vi.mocked(reconcileStripeWebhookEventApplicationUseCase).mockRejectedValueOnce(
        new Error('Falha no banco')
      );
      vi.mocked(releaseStripeWebhookEventUseCase).mockResolvedValueOnce();

      await PaymentController.stripeWebhook(webhookReq, res);

      expect(releaseStripeWebhookEventUseCase).toHaveBeenCalledWith('evt_123', 'Falha no banco');
      expect(completeStripeWebhookEventUseCase).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('retorna 409 quando claim for in_progress', async () => {
      const webhookReq = {
        headers: { 'stripe-signature': 'sig_valid' },
        body: Buffer.from('{}'),
      } as unknown as Request;

      vi.mocked(constructStripeWebhookEventUseCase).mockReturnValueOnce(sampleEvent);
      vi.mocked(claimStripeWebhookEventUseCase).mockResolvedValueOnce('in_progress');

      await PaymentController.stripeWebhook(webhookReq, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ received: false, inProgress: true });
      expect(reconcileStripeWebhookEventApplicationUseCase).not.toHaveBeenCalled();
    });
  });

  describe('confirmPlanPayment', () => {
    const user = {
      uid: 'partner-1',
      email: 'p@example.com',
      admin: false,
      emailVerified: true,
      authTime: 1700000000,
    };

    it('responde 404 para PaymentIntent de outro parceiro', async () => {
      vi.mocked(retrievePaymentIntentUseCase).mockResolvedValueOnce({
        id: 'pi_abc',
        status: 'succeeded',
        amountMinor: 9900,
        metadata: { partnerId: 'outro', referenceType: 'plan_payment' },
      } as never);
      await PaymentController.confirmPlanPayment(
        { user, body: { paymentIntentId: 'pi_abc' } } as AuthenticatedRequest,
        res
      );
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('informa succeeded sem ativar o plano (o webhook ativa)', async () => {
      vi.mocked(retrievePaymentIntentUseCase).mockResolvedValueOnce({
        id: 'pi_abc',
        status: 'succeeded',
        amountMinor: 9900,
        metadata: { partnerId: 'partner-1', referenceType: 'plan_payment' },
      } as never);
      await PaymentController.confirmPlanPayment(
        { user, body: { paymentIntentId: 'pi_abc' } } as AuthenticatedRequest,
        res
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'succeeded' });
    });

    it('rejeita paymentIntentId inválido com 400', async () => {
      await PaymentController.confirmPlanPayment(
        { user, body: { paymentIntentId: 'abc' } } as AuthenticatedRequest,
        res
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(retrievePaymentIntentUseCase).not.toHaveBeenCalled();
    });
  });
});
