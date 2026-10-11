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
      <legend className="text-xs font-semibold text-white/70 mb-2">
        {t('payment.checkout.methodLegend')}
      </legend>
      {OPTIONS.map(({ value: option, icon: Icon }) => {
        const selected = value === option;
        return (
          <label
            key={option}
            className={`flex items-start gap-3 min-h-11 p-3.5 rounded-2xl border cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-teal-400/50 ${
              selected
                ? 'border-teal-400/60 bg-teal-500/10'
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
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
              size={18}
              className={selected ? 'text-teal-300 mt-0.5' : 'text-white/60 mt-0.5'}
            />
            <span className="flex-1">
              <span className="block text-sm font-bold text-white">{labels[option].title}</span>
              <span className="block text-xs text-white/60 mt-0.5">{labels[option].hint}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
