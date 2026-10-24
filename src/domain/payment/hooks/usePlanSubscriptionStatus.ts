import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, normalizeLocale } from '../../../shared/i18n';
import { changePlanSubscriptionUseCase } from '../application/usecases/changePlanSubscriptionUseCase';
import { createBillingPortalSessionUseCase } from '../application/usecases/createBillingPortalSessionUseCase';
import { getPlanSubscriptionUseCase } from '../application/usecases/getPlanSubscriptionUseCase';
import { setPlanSubscriptionRenewalUseCase } from '../application/usecases/setPlanSubscriptionRenewalUseCase';
import type { PaidPlanId, PlanSubscription } from '../types/payment';
import { getPaymentErrorMessage } from '../utils/paymentErrorMessage';

export function usePlanSubscriptionStatus(itemId: string) {
  const { i18n } = useTranslation();
  const [data, setData] = useState<PlanSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPlanSubscriptionUseCase(itemId));
    } catch (err: unknown) {
      setError(getPaymentErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setRenewal = useCallback(
    async (renew: boolean) => {
      setActing(true);
      setError(null);
      try {
        setData(await setPlanSubscriptionRenewalUseCase(itemId, renew));
      } catch (err: unknown) {
        setError(getPaymentErrorMessage(err));
      } finally {
        setActing(false);
      }
    },
    [itemId]
  );

  /** Uma chave por clique: o botão fica travado enquanto a troca anterior não volta. */
  const changePlan = useCallback(
    async (planId: PaidPlanId) => {
      setActing(true);
      setError(null);
      try {
        setData(
          await changePlanSubscriptionUseCase({
            itemId,
            planId,
            idempotencyKey: crypto.randomUUID(),
          })
        );
        return true;
      } catch (err: unknown) {
        setError(getPaymentErrorMessage(err));
        return false;
      } finally {
        setActing(false);
      }
    },
    [itemId]
  );

  const openPortal = useCallback(async () => {
    setActing(true);
    setError(null);
    try {
      const { url } = await createBillingPortalSessionUseCase(
        normalizeLocale(i18n.language) ?? DEFAULT_LOCALE
      );
      window.location.assign(url);
    } catch (err: unknown) {
      setError(getPaymentErrorMessage(err));
      setActing(false);
    }
  }, [i18n.language]);

  return { data, loading, error, acting, reload, setRenewal, changePlan, openPortal };
}
