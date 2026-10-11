import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, normalizeLocale } from '../../../shared/i18n';
import { createBillingPortalSessionUseCase } from '../application/usecases/createBillingPortalSessionUseCase';
import { getPlanSubscriptionUseCase } from '../application/usecases/getPlanSubscriptionUseCase';
import { setPlanSubscriptionRenewalUseCase } from '../application/usecases/setPlanSubscriptionRenewalUseCase';
import type { PlanSubscription } from '../types/payment';
import { getPaymentErrorMessage } from '../utils/paymentErrorMessage';

export function usePlanSubscriptionStatus() {
  const { i18n } = useTranslation();
  const [data, setData] = useState<PlanSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getPlanSubscriptionUseCase());
    } catch (err: unknown) {
      setError(getPaymentErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setRenewal = useCallback(async (renew: boolean) => {
    setActing(true);
    setError(null);
    try {
      setData(await setPlanSubscriptionRenewalUseCase(renew));
    } catch (err: unknown) {
      setError(getPaymentErrorMessage(err));
    } finally {
      setActing(false);
    }
  }, []);

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

  return { data, loading, error, acting, reload, setRenewal, openPortal };
}
