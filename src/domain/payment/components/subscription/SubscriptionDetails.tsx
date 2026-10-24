import { useTranslation } from 'react-i18next';
import type { PlanPeriodOption, PlanSubscription } from '../../types/payment';
import { formatBillingDate, formatPlanAmount } from '../../utils/formatPlanAmount';
import { LIVE_SUBSCRIPTION_STATUSES } from './subscriptionStatus';

export const subscriptionButtonClass =
  'min-h-11 px-4 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50';

function useStatusMessage(subscription: PlanSubscription): string {
  const { t, i18n } = useTranslation();
  const date = subscription.currentPeriodEnd
    ? formatBillingDate(subscription.currentPeriodEnd, i18n.language)
    : '';
  if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    return t('payment.subscription.statusPastDue');
  }
  if (subscription.status === 'canceled' || subscription.status === 'incomplete_expired') {
    return t('payment.subscription.statusCanceled');
  }
  if (subscription.status === 'incomplete' || subscription.status === 'paused') {
    return t('payment.subscription.statusIncomplete');
  }
  if (subscription.cancelAtPeriodEnd) {
    return t('payment.subscription.statusCancelScheduled', { date });
  }
  return subscription.status === 'trialing'
    ? t('payment.subscription.statusTrialing', { date })
    : t('payment.subscription.statusActive', { date });
}

interface SubscriptionDetailsProps {
  subscription: PlanSubscription;
  plans: PlanPeriodOption[];
  acting: boolean;
  onManage: () => void;
  onToggleRenewal: () => void;
  onChangePeriod: () => void;
  onKeepCurrent: () => void;
}

export function SubscriptionDetails({
  subscription,
  plans,
  acting,
  onManage,
  onToggleRenewal,
  onChangePeriod,
  onKeepCurrent,
}: SubscriptionDetailsProps) {
  const { t, i18n } = useTranslation();
  const message = useStatusMessage(subscription);
  const isLive = LIVE_SUBSCRIPTION_STATUSES.has(subscription.status);
  const pending = plans.find((plan) => plan.id === subscription.pendingPlanId);

  return (
    <>
      <p
        className={
          subscription.status === 'past_due' ? 'text-sm text-amber-200' : 'text-sm text-white/80'
        }
      >
        {message}
      </p>
      {pending && subscription.pendingChangeAt && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-xs text-cyan-100 flex-1 min-w-[12rem]">
            {t('payment.subscription.pendingChange', {
              date: formatBillingDate(subscription.pendingChangeAt, i18n.language),
              plan: pending.name,
              amount: formatPlanAmount(pending.priceMinor, i18n.language),
            })}
          </p>
          <button
            type="button"
            onClick={onKeepCurrent}
            disabled={acting}
            className={`${subscriptionButtonClass} bg-white/10 hover:bg-white/15 text-white`}
          >
            {t('payment.subscription.keepCurrent')}
          </button>
        </div>
      )}
      {isLive && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onManage}
            disabled={acting}
            className={`${subscriptionButtonClass} bg-teal-400 hover:bg-teal-300 text-slate-950`}
          >
            {t('payment.subscription.manageCard')}
          </button>
          {plans.length > 1 && subscription.status !== 'past_due' && (
            <button
              type="button"
              onClick={onChangePeriod}
              disabled={acting}
              className={`${subscriptionButtonClass} bg-white/10 hover:bg-white/15 text-white`}
            >
              {t('payment.subscription.changePeriod')}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleRenewal}
            disabled={acting}
            className={`${subscriptionButtonClass} bg-white/10 hover:bg-white/15 text-white`}
          >
            {subscription.cancelAtPeriodEnd
              ? t('payment.subscription.resumeRenewal')
              : t('payment.subscription.cancelRenewal')}
          </button>
        </div>
      )}
    </>
  );
}
