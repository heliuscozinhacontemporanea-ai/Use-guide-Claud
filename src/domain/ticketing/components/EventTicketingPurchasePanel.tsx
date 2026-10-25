import { AlertCircle, Loader2, Sparkles, Ticket as TicketIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../shared/utils/money';
import { GlassCard } from '../../../ui/components/GlassCard';
import { TermsAcceptanceField } from '../../../ui/legal/TermsAcceptanceField';
import { useEventOccurrences } from '../../events';
import { useEventSalesPolicy } from '../hooks/useEventSalesPolicy';
import { useTicketCheckout } from '../hooks/useTicketCheckout';
import { usePublicTicketTypes } from '../hooks/useTicketTypes';
import { IssuedTicketsCard } from './checkout/IssuedTicketsCard';
import { OccurrencePicker } from './checkout/OccurrencePicker';
import { SalesPolicyNotice } from './checkout/SalesPolicyNotice';
import { TicketBuyerForm } from './checkout/TicketBuyerForm';
import { TicketOrderPaymentStep } from './checkout/TicketOrderPaymentStep';
import { TicketTypeList } from './checkout/TicketTypeList';

interface EventTicketingPurchasePanelProps {
  eventId?: string;
  occurrenceId?: string;
  eventTitle: string;
  userEmail?: string;
  userName?: string;
  onRequireLogin?: () => void;
  maxTicketsPerUser?: number;
  onOrderCompleted?: (orderId: string) => void;
}

export function EventTicketingPurchasePanel({
  eventId,
  occurrenceId: initialOccurrenceId,
  eventTitle,
  userEmail,
  userName,
  onRequireLogin,
  maxTicketsPerUser = 5,
  onOrderCompleted,
}: EventTicketingPurchasePanelProps) {
  const { t, i18n } = useTranslation();
  const { occurrences, loading: occurrencesLoading } = useEventOccurrences(
    !initialOccurrenceId && eventId ? eventId : undefined
  );
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(initialOccurrenceId || '');

  useEffect(() => {
    if (initialOccurrenceId) setSelectedOccurrenceId(initialOccurrenceId);
    else if (!selectedOccurrenceId && occurrences[0]) setSelectedOccurrenceId(occurrences[0].id);
  }, [initialOccurrenceId, occurrences, selectedOccurrenceId]);

  const occurrenceId = initialOccurrenceId || selectedOccurrenceId;
  const {
    ticketTypes,
    loading,
    error: loadError,
    reload,
  } = usePublicTicketTypes(occurrenceId || undefined);
  const salesPolicy = useEventSalesPolicy(eventId);
  const checkout = useTicketCheckout({
    occurrenceId,
    ticketTypes,
    maxTicketsPerUser,
    initialBuyer: { name: userName, email: userEmail },
    reloadTicketTypes: reload,
    onRequireLogin,
    onOrderCompleted,
  });
  const { order } = checkout;

  if ((loading || occurrencesLoading) && ticketTypes.length === 0) {
    return (
      <p
        role="status"
        className="p-4 rounded-2xl bg-surface border border-line flex items-center gap-3 text-ink/70 text-xs"
      >
        <Loader2 size={16} className="animate-spin text-teal-400" aria-hidden="true" />
        {t('ticketCheckout.loading')}
      </p>
    );
  }

  if (loadError) {
    return (
      <p
        role="alert"
        className="p-4 rounded-2xl bg-danger-soft border border-danger-line text-danger text-xs flex items-center gap-2"
      >
        <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
        {loadError}
      </p>
    );
  }

  if (ticketTypes.length === 0 && occurrences.length <= 1) return null;

  if (order?.status === 'paid') {
    return (
      <IssuedTicketsCard
        order={order}
        eventTitle={eventTitle}
        tickets={checkout.issuedTickets}
        onBuyMore={checkout.reset}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/80">
          <TicketIcon size={16} className="text-teal-400" aria-hidden="true" />
          {t('ticketCheckout.title')}
        </h4>
        <span className="text-xs text-ink/70">
          {t('ticketCheckout.limit', { count: checkout.effectiveMaxPerUser })}
        </span>
      </div>

      {!initialOccurrenceId && occurrences.length > 1 && !order && (
        <OccurrencePicker
          occurrences={occurrences}
          selectedId={selectedOccurrenceId}
          onSelect={(id) => {
            setSelectedOccurrenceId(id);
            checkout.clearQuantities();
          }}
        />
      )}

      {order ? (
        <TicketOrderPaymentStep order={order} checkout={checkout} />
      ) : (
        <>
          <TicketTypeList
            ticketTypes={ticketTypes}
            quantities={checkout.quantities}
            totalQuantity={checkout.totalQuantity}
            maxPerUser={checkout.effectiveMaxPerUser}
            onChange={checkout.changeQuantity}
          />

          {checkout.totalQuantity > 0 && (
            <GlassCard className="p-4 space-y-3">
              <TicketBuyerForm checkout={checkout} />
              {salesPolicy && !checkout.isAllFree && <SalesPolicyNotice policy={salesPolicy} />}
              <TermsAcceptanceField
                audience="buyer"
                checked={checkout.termsAccepted}
                onChange={checkout.setTermsAccepted}
              />
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-line">
                <div>
                  <span className="text-xs text-ink/70 block">
                    {t('ticketCheckout.ticketCount', { count: checkout.totalQuantity })}
                  </span>
                  <span className="text-base font-black text-accent">
                    {checkout.isAllFree
                      ? t('ticketCheckout.free')
                      : formatMoneyMinor(checkout.estimatedSubtotalMinor, i18n.language)}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={checkout.submitting || !checkout.termsAccepted}
                  onClick={() => void checkout.reserve()}
                  className="px-5 min-h-11 rounded-xl bg-teal-400 hover:bg-teal-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50"
                >
                  {checkout.submitting ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles size={16} aria-hidden="true" />
                  )}
                  {checkout.isAllFree
                    ? t('ticketCheckout.registerFree')
                    : t('ticketCheckout.reserve')}
                </button>
              </div>
            </GlassCard>
          )}
        </>
      )}

      {checkout.error && (
        <p
          role="alert"
          className="p-3 rounded-xl bg-danger-soft border border-danger-line text-danger text-xs flex items-center gap-2"
        >
          <AlertCircle size={15} className="shrink-0" aria-hidden="true" />
          {checkout.error}
        </p>
      )}
    </div>
  );
}
