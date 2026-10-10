import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentController } from './paymentController';
import { getPlanForPaymentApplicationUseCase } from '../../../application/usecases/getPlanForPaymentApplicationUseCase';
import { createPlanPaymentIntentUseCase } from '../usecases/paymentUseCases';
import { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

vi.mock('../../../application/usecases/getPlanForPaymentApplicationUseCase', () => ({
  getPlanForPaymentApplicationUseCase: vi.fn(),
}));

vi.mock('../usecases/paymentUseCases', () => ({
  createPlanPaymentIntentUseCase: vi.fn(),
  constructStripeWebhookEventUseCase: vi.fn(),
  markStripeWebhookEventProcessedUseCase: vi.fn(),
  retrievePaymentIntentUseCase: vi.fn(),
  updateTransactionStatusUseCase: vi.fn(),
}));

describe('PaymentController', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: any;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
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
        planId: 'plan-pro',
        idempotencyKey: 'unique-key-12345',
      },
    };

    vi.mocked(getPlanForPaymentApplicationUseCase).mockResolvedValueOnce({
      id: 'plan-pro',
      name: 'Plano Profissional',
      price: 99.0,
      isActive: true,
    } as any);
    vi.mocked(createPlanPaymentIntentUseCase).mockResolvedValueOnce({
      paymentIntentId: 'pi_123',
      clientSecret: 'pi_123_secret_abc',
      status: 'pending',
      transactionId: 'pi_123',
    });

    await PaymentController.createPlanPaymentIntent(req as AuthenticatedRequest, res);

    expect(createPlanPaymentIntentUseCase).toHaveBeenCalledWith(
      expect.objectContaining({
        buyerId: 'user-123',
        planId: 'plan-pro',
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
});
