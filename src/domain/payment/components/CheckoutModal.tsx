import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../ui/components/Dialog';
import { BUTTON_PRIMARY } from '../../../ui/styles/controls';
import type { PaidPlanId } from '../types/payment';
import { formatPlanAmount } from '../utils/formatPlanAmount';
import { OneTimePlanCheckout } from './subcomponents/OneTimePlanCheckout';
import { PaymentMethodChoice, type PlanPaymentMethod } from './subcomponents/PaymentMethodChoice';
import { SubscriptionPlanCheckout } from './subcomponents/SubscriptionPlanCheckout';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Estabelecimento que recebe o plano (D11). */
  itemId: string;
  planId: PaidPlanId;
  itemName: string;
  /** Valor do plano em centavos. */
  amountMinor: number;
  onPaymentSuccess?: (paymentId: string) => void;
}

/** Pagamento do plano do estabelecimento numa folha (D33): escolhe o meio e paga pelo Stripe. */
export function CheckoutModal({
  isOpen,
  onClose,
  itemId,
  planId,
  itemName,
  amountMinor,
  onPaymentSuccess,
}: CheckoutModalProps) {
  const { t, i18n } = useTranslation();
  const [method, setMethod] = useState<PlanPaymentMethod>('subscription');
  const [confirmedMethod, setConfirmedMethod] = useState<PlanPaymentMethod | null>(null);

  const handleClose = () => {
    setConfirmedMethod(null);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      nested
      title={t('payment.checkout.title')}
      description={itemName}
    >
      <div className="space-y-5">
        <div className="p-4 rounded-card bg-surface border border-line flex items-center justify-between gap-3">
          <span className="text-meta text-ink-muted">{t('payment.checkout.totalLabel')}</span>
          <span className="text-right">
            <span className="block text-heading font-bold text-accent tabular-nums">
              {formatPlanAmount(amountMinor, i18n.language)}
            </span>
            <span className="block text-caption text-ink-muted">
              {t(`payment.period.${planId}`)}
            </span>
          </span>
        </div>

        {confirmedMethod === null && (
          <div className="space-y-4">
            <PaymentMethodChoice value={method} onChange={setMethod} />
            <button
              type="button"
              onClick={() => setConfirmedMethod(method)}
              className={`${BUTTON_PRIMARY} w-full min-h-12`}
            >
              {t('payment.checkout.continue')}
            </button>
          </div>
        )}

        {confirmedMethod === 'subscription' && (
          <SubscriptionPlanCheckout
            itemId={itemId}
            planId={planId}
            itemName={itemName}
            amountMinor={amountMinor}
            onClose={handleClose}
            onActivated={onPaymentSuccess}
          />
        )}

        {confirmedMethod === 'one_time' && (
          <OneTimePlanCheckout
            itemId={itemId}
            planId={planId}
            itemName={itemName}
            amountMinor={amountMinor}
            onClose={handleClose}
            onPaymentSuccess={onPaymentSuccess}
          />
        )}

        <p className="flex items-center justify-center gap-2 text-caption text-ink-muted">
          <ShieldCheck size={16} className="text-accent shrink-0" aria-hidden="true" />
          {t('payment.checkout.secureFooter')}
        </p>
      </div>
    </Dialog>
  );
}
