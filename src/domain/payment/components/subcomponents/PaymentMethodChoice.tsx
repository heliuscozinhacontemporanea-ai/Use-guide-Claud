import { CreditCard, QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type PlanPaymentMethod = 'subscription' | 'one_time';

interface PaymentMethodChoiceProps {
  value: PlanPaymentMethod;
  onChange: (value: PlanPaymentMethod) => void;
}

const OPTIONS: Array<{ value: PlanPaymentMethod; icon: typeof CreditCard }> = [
  { value: 'subscription', icon: CreditCard },
  { value: 'one_time', icon: QrCode },
];

export function PaymentMethodChoice({ value, onChange }: PaymentMethodChoiceProps) {
  const { t } = useTranslation();
  const labels: Record<PlanPaymentMethod, { title: string; hint: string }> = {
    subscription: {
      title: t('payment.checkout.methodSubscription'),
      hint: t('payment.checkout.methodSubscriptionHint'),
    },
    one_time: {
      title: t('payment.checkout.methodOneTime'),
      hint: t('payment.checkout.methodOneTimeHint'),
    },
  };

  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-meta font-semibold text-ink-muted">
        {t('payment.checkout.methodLegend')}
      </legend>
      {OPTIONS.map(({ value: option, icon: Icon }) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={`flex items-start gap-3 min-h-11 p-3.5 rounded-card border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-teal-400/50 ${
              selected
                ? 'border-accent-line bg-accent-soft'
                : 'border-line bg-surface hover:bg-accent-soft'
            }`}
          >
            <input
              type="radio"
              name="plan-payment-method"
              value={option}
              checked={selected}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <Icon
              size={20}
              aria-hidden="true"
              className={selected ? 'text-accent mt-0.5' : 'text-ink-muted mt-0.5'}
            />
            <span className="flex-1">
              <span className="block text-control font-semibold text-ink">
                {labels[option].title}
              </span>
              <span className="block mt-0.5 text-meta text-ink-muted">{labels[option].hint}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
