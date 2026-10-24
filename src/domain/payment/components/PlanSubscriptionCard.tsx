import { CreditCard, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../ui/components/ConfirmDialog';
import { GlassCard } from '../../../ui/components/GlassCard';
import { Skeleton } from '../../../ui/components/Skeleton';
import { usePlanSubscriptionStatus } from '../hooks/usePlanSubscriptionStatus';
import type { PlanPeriodOption } from '../types/payment';
import { formatBillingDate } from '../utils/formatPlanAmount';
import { PlanPeriodChange } from './subscription/PlanPeriodChange';
import { SubscriptionDetails } from './subscription/SubscriptionDetails';
import { LIVE_SUBSCRIPTION_STATUSES } from './subscription/subscriptionStatus';

interface PlanSubscriptionCardProps {
  itemId: string;
  /** Períodos pagos do catálogo, para a troca na próxima renovação (D13). */
  plans?: PlanPeriodOption[];
  /** Avisa se o estabelecimento tem assinatura viva: quem monta o card esconde a compra nova. */
  onLiveChange?: (live: boolean) => void;
}

/** Assinatura do plano de um estabelecimento. Não renderiza nada se ele nunca assinou. */
export function PlanSubscriptionCard({
  itemId,
  plans = [],
  onLiveChange,
}: PlanSubscriptionCardProps) {
  const { t, i18n } = useTranslation();
  const { data, loading, error, acting, reload, setRenewal, changePlan, openPortal } =
    usePlanSubscriptionStatus(itemId);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [changing, setChanging] = useState(false);

  const live = Boolean(data && LIVE_SUBSCRIPTION_STATUSES.has(data.status));
  useEffect(() => {
    if (!loading) onLiveChange?.(live);
  }, [live, loading, onLiveChange]);

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
        <CreditCard size={18} className="text-accent" aria-hidden="true" />
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
          <p className="text-xs text-danger">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="press min-h-11 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
          >
            <RefreshCw size={13} aria-hidden="true" />
            <span>{t('payment.subscription.retry')}</span>
          </button>
        </div>
      )}
      {!loading && data && changing && (
        <PlanPeriodChange
          subscription={data}
          plans={plans}
          acting={acting}
          onBack={() => setChanging(false)}
          onConfirm={(planId) => {
            void changePlan(planId).then((done) => {
              if (done) setChanging(false);
            });
          }}
        />
      )}
      {!loading && data && !changing && (
        <SubscriptionDetails
          subscription={data}
          plans={plans}
          acting={acting}
          onManage={() => void openPortal()}
          onToggleRenewal={requestToggleRenewal}
          onChangePeriod={() => setChanging(true)}
          onKeepCurrent={() => void changePlan(data.planId)}
        />
      )}
      <ConfirmDialog data={confirm} />
    </GlassCard>
  );
}
