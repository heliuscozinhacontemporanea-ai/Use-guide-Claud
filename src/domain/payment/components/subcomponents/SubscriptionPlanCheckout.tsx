import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StripePaymentElement } from '../../adapters/ui/StripePaymentElement';
import { usePlanSubscriptionCheckout } from '../../hooks/usePlanSubscriptionCheckout';
import type { PaidPlanId } from '../../types/payment';
import { formatPlanAmount } from '../../utils/formatPlanAmount';
import { CheckoutError, CheckoutLoading, CheckoutPending } from './CheckoutStatusNotice';

interface SubscriptionPlanCheckoutProps {
  planId: PaidPlanId;
  itemName: string;
  amountMinor: number;
  onClose: () => void;
  onActivated?: (subscriptionId: string) => void;
}

export function SubscriptionPlanCheckout({
  planId,
  itemName,
  amountMinor,
  onClose,
  onActivated,
}: SubscriptionPlanCheckoutProps) {
  const { t, i18n } = useTranslation();
  const { status, error, checkout, start, waitForActivation, fail, reset } =
    usePlanSubscriptionCheckout(planId);

  useEffect(() => {
    if (status === 'idle') {
      void start();
    }
  }, [status, start]);

  useEffect(() => {
    if (status === 'active' && checkout) {
      onActivated?.(checkout.subscriptionId);
    }
  }, [status, checkout, onActivated]);

  useEffect(() => {
    if (status === 'activating' && checkout && !checkout.clientSecret) {
      waitForActivation();
    }
  }, [status, checkout, waitForActivation]);

  if (status === 'active') {
    return (
      <div className="py-6 flex flex-col items-center text-center gap-3" role="status">
        <CheckCircle2 size={40} className="text-emerald-400" />
        <p className="text-base font-bold text-white">{t('payment.checkout.successTitle')}</p>
        <p className="text-xs text-white/70">
          {t('payment.checkout.successDescription', { plan: itemName })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 px-5 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-sm font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('payment.checkout.close')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <CheckoutError message={error} onRetry={status === 'failed' ? reset : undefined} />}
      {status === 'starting' && <CheckoutLoading />}
      {status === 'activating' && (
        <CheckoutPending
          title={t('payment.checkout.activatingTitle')}
          description={t('payment.checkout.activatingDescription')}
        />
      )}
      {status === 'delayed' && (
        <CheckoutPending
          title={t('payment.checkout.processingTitle')}
          description={t('payment.checkout.activationDelayed')}
        />
      )}
      {status === 'ready' && checkout?.clientSecret && (
        <>
          {checkout.intentType === 'setup' && (
            <p className="text-xs text-white/70">{t('payment.checkout.trialNotice')}</p>
          )}
          <StripePaymentElement
            returnKind="plan"
            clientSecret={checkout.clientSecret}
            orderId={checkout.subscriptionId}
            intentType={checkout.intentType === 'setup' ? 'setup' : 'payment'}
            submitLabel={t('payment.checkout.subscribeButton', {
              amount: formatPlanAmount(amountMinor, i18n.language),
              period: t(`payment.period.${planId}`),
            })}
            onError={fail}
            onSuccess={waitForActivation}
          />
        </>
      )}
    </div>
  );
}
