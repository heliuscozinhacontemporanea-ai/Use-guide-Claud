import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StripePaymentElement } from '../../adapters/ui/StripePaymentElement';
import { usePayment } from '../../hooks/usePayment';
import type { PaidPlanId } from '../../types/payment';
import { formatPlanAmount } from '../../utils/formatPlanAmount';
import { CheckoutError, CheckoutLoading, CheckoutPending } from './CheckoutStatusNotice';
import { SuccessPaymentGlass } from './SuccessPaymentGlass';

interface OneTimePlanCheckoutProps {
  planId: PaidPlanId;
  itemName: string;
  amountMinor: number;
  onClose: () => void;
  onPaymentSuccess?: (paymentId: string) => void;
}

export function OneTimePlanCheckout({
  planId,
  itemName,
  amountMinor,
  onClose,
  onPaymentSuccess,
}: OneTimePlanCheckoutProps) {
  const { t, i18n } = useTranslation();
  const {
    loading,
    error,
    setError,
    clientSecret,
    paymentIntentId,
    status,
    initializePlanPayment,
    confirmPaymentOnBackend,
    resetAttempt,
  } = usePayment({ planId, onSuccess: onPaymentSuccess });

  useEffect(() => {
    if (status === 'idle') {
      void initializePlanPayment();
    }
  }, [status, initializePlanPayment]);

  if (status === 'succeeded' && paymentIntentId) {
    return (
      <SuccessPaymentGlass
        itemName={itemName}
        amountMinor={amountMinor}
        paymentId={paymentIntentId}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <CheckoutError
          message={error}
          onRetry={() => {
            resetAttempt();
            void initializePlanPayment();
          }}
        />
      )}
      {loading && <CheckoutLoading />}
      {status === 'processing' && (
        <CheckoutPending
          title={t('payment.checkout.processingTitle')}
          description={t('payment.checkout.processingDescription')}
        />
      )}
      {!loading && clientSecret && paymentIntentId && (
        <StripePaymentElement
          returnKind="plan"
          clientSecret={clientSecret}
          orderId={paymentIntentId}
          submitLabel={t('payment.checkout.payButton', {
            amount: formatPlanAmount(amountMinor, i18n.language),
          })}
          onError={(message) => setError(message)}
          onSuccess={(intentId) => confirmPaymentOnBackend(intentId)}
        />
      )}
    </div>
  );
}
