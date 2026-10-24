import { CreditCard, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../ui/components/ConfirmDialog';
import { GlassCard } from '../../../ui/components/GlassCard';
import { Skeleton } from '../../../ui/components/Skeleton';
import { usePlanSubscriptionStatus } from '../hooks/usePlanSubscriptionStatus';
import type { PlanSubscription } from '../types/payment';
import { formatBillingDate } from '../utils/formatPlanAmount';

const LIVE_STATUSES: ReadonlySet<PlanSubscription['status']> = new Set([
  'active',
  'trialing',
  'past_due',
]);

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

function SubscriptionDetails({
  subscription,
  acting,
  onManage,
  onToggleRenewal,
}: {
  subscription: PlanSubscription;
  acting: boolean;
  onManage: () => void;
  onToggleRenewal: () => void;
}) {
  const { t } = useTranslation();
  const message = useStatusMessage(subscription);
  const isLive = LIVE_STATUSES.has(subscription.status);
  const buttonClass =
    'min-h-11 px-4 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50';

  return (
    <>
      <p
        className={
          subscription.status === 'past_due' ? 'text-sm text-amber-200' : 'text-sm text-white/80'
        }
      >
        {message}
      </p>
      {isLive && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onManage}
            disabled={acting}
            className={`${buttonClass} bg-teal-400 hover:bg-teal-300 text-slate-950`}
          >
            {t('payment.subscription.manageCard')}
          </button>
          <button
            type="button"
            onClick={onToggleRenewal}
            disabled={acting}
            className={`${buttonClass} bg-white/10 hover:bg-white/15 text-white`}
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

/** Assinatura do plano de um estabelecimento. Não renderiza nada se ele nunca assinou. */
export function PlanSubscriptionCard({ itemId }: { itemId: string }) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, acting, reload, setRenewal, openPortal } =
    usePlanSubscriptionStatus(itemId);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);

  if (!loading && !error && !data) {
    return null;
  }

  const requestToggleRenewal = () => {
    if (!data) return;
    if (data.cancelAtPeriodEnd) {
      void setRenewal(true);
      return;
    }
    setConfirm({
      message: t('payment.subscription.confirmCancel', {
        date: data.currentPeriodEnd ? formatBillingDate(data.currentPeriodEnd, i18n.language) : '',
      }),
      onConfirm: () => {
        setConfirm(null);
        void setRenewal(false);
      },
      onCancel: () => setConfirm(null),
    });
  };

  return (
    <GlassCard className="p-5 space-y-3 border border-white/10">
      <div className="flex items-center gap-2">
        <CreditCard size={18} className="text-teal-300" />
        <h2 className="text-sm font-bold text-white">{t('payment.subscription.title')}</h2>
      </div>
      {loading && (
        <div role="status">
          <Skeleton className="h-10 w-full" />
          <span className="sr-only">{t('payment.subscription.loading')}</span>
        </div>
      )}
      {!loading && error && (
        <div className="flex flex-wrap items-center gap-3" role="alert">
          <p className="text-xs text-red-200">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <RefreshCw size={13} />
            <span>{t('payment.subscription.retry')}</span>
          </button>
        </div>
      )}
      {!loading && data && (
        <SubscriptionDetails
          subscription={data}
          acting={acting}
          onManage={() => void openPortal()}
          onToggleRenewal={requestToggleRenewal}
        />
      )}
      <ConfirmDialog data={confirm} />
    </GlassCard>
  );
}
