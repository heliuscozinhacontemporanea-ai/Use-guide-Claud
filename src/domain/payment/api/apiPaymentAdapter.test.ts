import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import { ApiPaymentAdapter } from './apiPaymentAdapter';

vi.mock('../../../shared/infrastructure/firebase/firebaseApiFetch', () => ({
  firebaseApiFetch: vi.fn(),
}));

function mockResponse(ok: boolean, body: unknown) {
  vi.mocked(firebaseApiFetch).mockResolvedValueOnce({
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response);
}

describe('ApiPaymentAdapter — assinatura do plano', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inicia a assinatura com autenticação e App Check', async () => {
    mockResponse(true, {
      subscriptionId: 'sub_1',
      status: 'incomplete',
      clientSecret: 's',
      intentType: 'payment',
    });
    const payload = {
      planId: 'monthly' as const,
      locale: 'pt-BR' as const,
      idempotencyKey: 'key-12345',
    };
    await expect(new ApiPaymentAdapter().startPlanSubscription(payload)).resolves.toMatchObject({
      subscriptionId: 'sub_1',
    });
    expect(firebaseApiFetch).toHaveBeenCalledWith(
      '/api/payment/plans/subscriptions',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(payload) }),
      { requireAuth: true, requireAppCheck: true }
    );
  });

  it('lança o código estável do backend para a UI traduzir', async () => {
    mockResponse(false, { error: { code: 'SUBSCRIPTION_ALREADY_ACTIVE', message: 'x' } });
    await expect(
      new ApiPaymentAdapter().startPlanSubscription({
        planId: 'monthly',
        locale: 'pt-BR',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toThrow('SUBSCRIPTION_ALREADY_ACTIVE');
  });

  it('resposta de erro sem código vira BILLING_UNAVAILABLE', async () => {
    mockResponse(false, {});
    await expect(new ApiPaymentAdapter().getPlanSubscription()).rejects.toThrow(
      'BILLING_UNAVAILABLE'
    );
  });

  it('cancelar e retomar usam rotas distintas', async () => {
    mockResponse(true, { subscription: null });
    mockResponse(true, { subscription: null });
    const adapter = new ApiPaymentAdapter();
    await adapter.setPlanSubscriptionRenewal(false);
    await adapter.setPlanSubscriptionRenewal(true);
    expect(vi.mocked(firebaseApiFetch).mock.calls.map((call) => call[0])).toEqual([
      '/api/payment/plans/subscription/cancel',
      '/api/payment/plans/subscription/resume',
    ]);
  });
});
