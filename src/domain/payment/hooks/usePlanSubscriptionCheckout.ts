import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, normalizeLocale } from '../../../shared/i18n';
import { getPlanSubscriptionUseCase } from '../application/usecases/getPlanSubscriptionUseCase';
import { startPlanSubscriptionUseCase } from '../application/usecases/startPlanSubscriptionUseCase';
import type { PaidPlanId, StartPlanSubscriptionResponse } from '../types/payment';
import { getPaymentErrorMessage } from '../utils/paymentErrorMessage';

const POLL_INTERVAL_MS = 3_000;
const POLL_TIMEOUT_MS = 60_000;

export type PlanSubscriptionCheckoutStatus =
  | 'idle'
  | 'starting'
  | 'ready'
  | 'activating'
  | 'active'
  | 'delayed'
  | 'failed';

export function usePlanSubscriptionCheckout(itemId: string, planId: PaidPlanId) {
  const { i18n } = useTranslation();
  const [status, setStatus] = useState<PlanSubscriptionCheckoutStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<StartPlanSubscriptionResponse | null>(null);
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const start = useCallback(async () => {
    setStatus('starting');
    setError(null);
    try {
      const response = await startPlanSubscriptionUseCase({
        itemId,
        planId,
        locale: normalizeLocale(i18n.language) ?? DEFAULT_LOCALE,
        idempotencyKey: idempotencyKeyRef.current,
      });
      setCheckout(response);
      setStatus(response.clientSecret ? 'ready' : 'activating');
    } catch (err: unknown) {
      setError(getPaymentErrorMessage(err));
      setStatus('failed');
    }
  }, [itemId, planId, i18n.language]);

  // O webhook é a fonte da verdade (AGENTS.md §8.4): consultamos o backend até ele confirmar.
  const waitForActivation = useCallback(() => {
    stopPolling();
    setStatus('activating');
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    const poll = async () => {
      try {
        const subscription = await getPlanSubscriptionUseCase(itemId);
        if (subscription?.status === 'active' || subscription?.status === 'trialing') {
          setStatus('active');
          return;
        }
      } catch {
        // Falha pontual de rede: tenta de novo até o prazo.
      }
      if (Date.now() >= deadline) {
        setStatus('delayed');
        return;
      }
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    };
    void poll();
  }, [itemId, stopPolling]);

  const fail = useCallback((message: string) => {
    setError(message);
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    idempotencyKeyRef.current = crypto.randomUUID();
    setCheckout(null);
    setError(null);
    setStatus('idle');
  }, [stopPolling]);

  return { status, error, checkout, start, waitForActivation, fail, reset };
}
