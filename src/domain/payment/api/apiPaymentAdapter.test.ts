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
      itemId: 'item-1',
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
        itemId: 'item-1',
        planId: 'monthly',
        locale: 'pt-BR',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toThrow('SUBSCRIPTION_ALREADY_ACTIVE');
  });

  it('resposta de erro sem código vira BILLING_UNAVAILABLE', async () => {
    mockResponse(false, {});
    await expect(new ApiPaymentAdapter().getPlanSubscription('item-1')).rejects.toThrow(
      'BILLING_UNAVAILABLE'
    );
  });

  it('lê a assinatura do estabelecimento pelo itemId na query', async () => {
    mockResponse(true, { subscription: null });
    await expect(new ApiPaymentAdapter().getPlanSubscription('item-1')).resolves.toBeNull();
    expect(vi.mocked(firebaseApiFetch).mock.calls[0]?.[0]).toBe(
      '/api/payment/plans/subscription?itemId=item-1'
    );
  });

  it('cancelar e retomar usam rotas distintas e levam o itemId', async () => {
    mockResponse(true, { subscription: null });
    mockResponse(true, { subscription: null });
    const adapter = new ApiPaymentAdapter();
    await adapter.setPlanSubscriptionRenewal('item-1', false);
    await adapter.setPlanSubscriptionRenewal('item-1', true);
    const calls = vi.mocked(firebaseApiFetch).mock.calls;
    expect(calls.map((call) => call[0])).toEqual([
      '/api/payment/plans/subscription/cancel',
      '/api/payment/plans/subscription/resume',
    ]);
    expect(calls[0]?.[1]).toMatchObject({ body: JSON.stringify({ itemId: 'item-1' }) });
  });

  it('Pix avulso lança o code do topo do corpo', async () => {
    mockResponse(false, { error: 'Verifique antes.', code: 'LISTING_PENDING_VERIFICATION' });
    await expect(
      new ApiPaymentAdapter().createPlanPaymentIntent({
        itemId: 'item-1',
        planId: 'annual',
        idempotencyKey: 'key-12345',
      })
    ).rejects.toThrow('LISTING_PENDING_VERIFICATION');
  });
});
