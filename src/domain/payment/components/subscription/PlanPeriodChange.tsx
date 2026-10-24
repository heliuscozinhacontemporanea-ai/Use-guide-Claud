import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { PaidPlanId, PlanPeriodOption, PlanSubscription } from '../../types/payment';
import { formatBillingDate, formatPlanAmount } from '../../utils/formatPlanAmount';
import { subscriptionButtonClass } from './SubscriptionDetails';

interface PlanPeriodChangeProps {
  subscription: PlanSubscription;
  plans: PlanPeriodOption[];
  acting: boolean;
  onConfirm: (planId: PaidPlanId) => void;
  onBack: () => void;
}

/** Troca de período na próxima renovação (D13): sem proração e sem pedir o cartão de novo. */
export function PlanPeriodChange({
  subscription,
  plans,
  acting,
  onConfirm,
  onBack,
}: PlanPeriodChangeProps) {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<PaidPlanId>(
    subscription.pendingPlanId ?? subscription.planId
  );
  const date = subscription.currentPeriodEnd
    ? formatBillingDate(subscription.currentPeriodEnd, i18n.language)
    : '';
  const unchanged = selected === (subscription.pendingPlanId ?? subscription.planId);

  return (
    <fieldset className="space-y-2.5">
      <legend className="text-xs font-bold text-white/80">
        {t('payment.subscription.changeTitle')}
      </legend>
      <p className="text-[11px] text-white/60 leading-relaxed">
        {t('payment.subscription.changeHint', { date })}
      </p>
      {plans.map((plan) => (
        <button
          key={plan.id}
          type="button"
          aria-pressed={selected === plan.id}
          onClick={() => setSelected(plan.id)}
          className={cn(
            'press w-full min-h-[48px] px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50',
            selected === plan.id
              ? 'bg-accent-soft border-accent-line'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          )}
        >
          <span className="text-xs font-bold text-white">
            {plan.name}
            {plan.id === subscription.planId && (
              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold text-white/70">
                {t('payment.subscription.currentPeriod')}
              </span>
            )}
          </span>
          <span className="text-sm font-black text-accent">
            {formatPlanAmount(plan.priceMinor, i18n.language)}
          </span>
        </button>
      ))}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => onConfirm(selected)}
          disabled={acting || unchanged}
          className={`${subscriptionButtonClass} bg-teal-400 hover:bg-teal-300 text-slate-950`}
        >
          {t('payment.subscription.changeConfirm', { date })}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={acting}
          className={`${subscriptionButtonClass} bg-white/10 hover:bg-white/15 text-white`}
        >
          {t('payment.subscription.changeBack')}
        </button>
      </div>
    </fieldset>
  );
}
