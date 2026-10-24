import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { i18n } from '../../../shared/i18n';
import { getPlanSubscriptionUseCase } from '../application/usecases/getPlanSubscriptionUseCase';
import { startPlanSubscriptionUseCase } from '../application/usecases/startPlanSubscriptionUseCase';
import { usePlanSubscriptionCheckout } from './usePlanSubscriptionCheckout';

vi.mock('../application/usecases/startPlanSubscriptionUseCase', () => ({
  startPlanSubscriptionUseCase: vi.fn(),
}));
vi.mock('../application/usecases/getPlanSubscriptionUseCase', () => ({
  getPlanSubscriptionUseCase: vi.fn(),
}));

const ACTIVE = {
  itemId: 'item-1',
  planId: 'monthly' as const,
  status: 'active' as const,
  currentPeriodEnd: '2026-11-10T12:00:00.000Z',
  cancelAtPeriodEnd: false,
};

describe('usePlanSubscriptionCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('guarda o segredo e o tipo de confirmação devolvidos pelo backend', async () => {
    vi.mocked(startPlanSubscriptionUseCase).mockResolvedValue({
      subscriptionId: 'sub_1',
      status: 'trialing',
      clientSecret: 'seti_secret',
      intentType: 'setup',
    });
    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'annual'));
    await act(async () => {
      await result.current.start();
    });
    expect(startPlanSubscriptionUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: 'item-1', planId: 'annual', locale: expect.any(String) })
    );
    expect(result.current.status).toBe('ready');
    expect(result.current.checkout?.intentType).toBe('setup');
  });

  it('traduz o erro pelo código no idioma ativo', async () => {
    await i18n.changeLanguage('fr');
    vi.mocked(startPlanSubscriptionUseCase).mockRejectedValue(
      new Error('SUBSCRIPTION_ALREADY_ACTIVE')
    );
    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'monthly'));
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('Vous avez déjà un abonnement actif.');
    await i18n.changeLanguage('pt-BR');
  });

  it('consulta o backend até o webhook confirmar a assinatura', async () => {
    vi.mocked(getPlanSubscriptionUseCase)
      .mockResolvedValueOnce({ ...ACTIVE, status: 'incomplete' })
      .mockResolvedValueOnce(ACTIVE);
    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'monthly'));
    await act(async () => {
      result.current.waitForActivation();
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.status).toBe('activating');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000);
    });
    expect(result.current.status).toBe('active');
    expect(getPlanSubscriptionUseCase).toHaveBeenCalledTimes(2);
    expect(getPlanSubscriptionUseCase).toHaveBeenCalledWith('item-1');
  });

  it('para de consultar depois de 60 s e avisa que a confirmação atrasou', async () => {
    vi.mocked(getPlanSubscriptionUseCase).mockResolvedValue({ ...ACTIVE, status: 'incomplete' });
    const { result } = renderHook(() => usePlanSubscriptionCheckout('item-1', 'monthly'));
    await act(async () => {
      result.current.waitForActivation();
      await vi.advanceTimersByTimeAsync(61_000);
    });
    expect(result.current.status).toBe('delayed');
    const calls = vi.mocked(getPlanSubscriptionUseCase).mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });
    expect(getPlanSubscriptionUseCase).toHaveBeenCalledTimes(calls);
  });
});
