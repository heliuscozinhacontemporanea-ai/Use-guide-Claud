import { RefreshCw, ShieldCheck } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUI } from '../../../../shared/stores/useUIStore';
import { Dialog } from '../../../../ui/components/Dialog';
import { useListingPlan } from '../../hooks/useListingPlan';
import { useListingVerification } from '../../hooks/useListingVerification';
import type { PlanListingOption } from '../../types/listingPlan';
import type { SubscriptionPlan } from '../../types/partner';
import { formatPlanDate } from '../../utils/listingPlanStatus';
import { ListingPlanBenefits } from './ListingPlanBenefits';
import { type ListingPlanChoice, ListingPlanOptions } from './ListingPlanOptions';
import { ListingPlanStatus } from './ListingPlanStatus';

export interface PaidPlanSelection {
  itemId: string;
  planId: SubscriptionPlan['id'];
  itemName: string;
  amountMinor: number;
}

interface ListingPlanDialogProps {
  listing: PlanListingOption;
  plans: SubscriptionPlan[];
  onClose: () => void;
  onVerify: () => void;
  onSelectPaidPlan: (selection: PaidPlanSelection) => void;
  /**
   * Assinatura no cartão deste estabelecimento (domínio payment), montada pela composição. Com
   * assinatura viva, a troca de período fica nela (D13) e o diálogo esconde a compra nova.
   */
  renderSubscription?: (itemId: string, onLiveChange: (live: boolean) => void) => ReactNode;
}

const buttonClass =
  'press w-full min-h-12 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function ListingPlanDialog({
  listing,
  plans,
  onClose,
  onVerify,
  onSelectPaidPlan,
  renderSubscription,
}: ListingPlanDialogProps) {
  const { t, i18n } = useTranslation();
  const { showToast } = useUI();
  const plan = useListingPlan(listing.id);
  const verification = useListingVerification(listing.id);
  const [choice, setChoice] = useState<ListingPlanChoice | null>(null);
  const [subscriptionLive, setSubscriptionLive] = useState(false);
  const loading = plan.loading || verification.loading;
  const error = plan.error ?? verification.error;
  const verified = verification.data?.status === 'approved';

  const proceed = async () => {
    if (choice === 'trial') {
      try {
        const view = await plan.activateTrial();
        showToast(
          t('listingPlan.trialActivated', {
            date: view.planUntil ? formatPlanDate(view.planUntil, i18n.language) : '',
          }),
          'success'
        );
      } catch (err: unknown) {
        showToast(
          err instanceof Error ? err.message : t('listingPlan.errors.INTERNAL_ERROR'),
          'error'
        );
      }
      return;
    }
    const selected = plans.find((option) => option.id === choice);
    if (!selected) return;
    onSelectPaidPlan({
      itemId: listing.id,
      planId: selected.id,
      itemName: t('listingPlan.checkoutName', { plan: selected.name, name: listing.name }),
      amountMinor: selected.priceMinor,
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={t('listingPlan.dialog.title')}
      description={listing.name}
      className="max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar"
    >
      <div className="space-y-5 pt-2">
        {loading ? (
          <p role="status" className="text-sm text-white/60">
            {t('listingPlan.dialog.loading')}
          </p>
        ) : error || !plan.data ? (
          <div className="space-y-3">
            <p className="text-sm text-danger">{error}</p>
            <button
              type="button"
              onClick={() => {
                void plan.reload();
                void verification.reload();
              }}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 rounded-2xl border border-white/10 text-xs text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-teal-400/50"
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t('listingPlan.dialog.retry')}
            </button>
          </div>
        ) : (
          <>
            <ListingPlanStatus view={plan.data} />
            {renderSubscription?.(listing.id, setSubscriptionLive)}
            <ListingPlanBenefits />
            {subscriptionLive ? null : verified ? (
              <>
                <ListingPlanOptions
                  plans={plans}
                  trialAvailable={plan.data.trialAvailable}
                  selected={choice}
                  onSelect={setChoice}
                />
                <button
                  type="button"
                  onClick={() => void proceed()}
                  disabled={choice === null || plan.activating}
                  className={`${buttonClass} bg-teal-400 hover:bg-teal-300 text-slate-950`}
                >
                  {plan.activating
                    ? t('listingPlan.actions.processing')
                    : choice === 'trial'
                      ? t('listingPlan.actions.activateTrial')
                      : t('listingPlan.actions.continue')}
                </button>
              </>
            ) : (
              <div className="space-y-3 p-4 rounded-2xl bg-warn-soft border border-warn-line">
                <p className="text-xs text-warn leading-relaxed">
                  {t('listingPlan.verificationRequired')}
                </p>
                <button
                  type="button"
                  onClick={onVerify}
                  className={`${buttonClass} bg-white/10 hover:bg-white/15 text-white`}
                >
                  <ShieldCheck size={14} aria-hidden="true" />
                  {t('listingPlan.verifyAction')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Dialog>
  );
}
