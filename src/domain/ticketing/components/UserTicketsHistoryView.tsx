import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Ticket as TicketIcon } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { ConfirmDialog, type ConfirmDialogData } from '../../../ui/components/ConfirmDialog';
import { GlassCard } from '../../../ui/components/GlassCard';
import { SegmentedControl } from '../../../ui/components/SegmentedControl';
import { formatMoneyMinor } from '../../../shared/utils/money';
import { cn } from '../../../shared/utils/cn';
import { useTicketWalletActions } from '../hooks/useTicketWalletActions';
import { useUserTicketsAndOrders } from '../hooks/useUserTickets';
import type { TicketOrder } from '../types/ticketing';
import {
  canRequestRefund,
  canTransferTicket,
  previewOrderRefundMinor,
} from '../utils/ticketWalletRules';
import { ResumePaymentCard } from './wallet/ResumePaymentCard';
import { TransferTicketForm } from './wallet/TransferTicketForm';
import { WalletOrderCard } from './wallet/WalletOrderCard';
import { WalletTicketCard } from './wallet/WalletTicketCard';

/** Venda que o comprador pode reclamar; o formato é o de `ClaimableSale` do payment. */
export interface TicketOrderClaimSale {
  referenceType: 'ticket_order';
  referenceId: string;
  serviceStartsAt: string;
  serviceEndsAt: string;
}

interface UserTicketsHistoryViewProps {
  onBack?: () => void;
  /** Slot da composição para "Relatar problema" (D16, 2A). */
  renderClaimAction?: (sale: TicketOrderClaimSale) => ReactNode;
}

function claimSaleOf(order: TicketOrder): TicketOrderClaimSale | null {
  if (!order.eventSnapshot) return null;
  if (order.status !== 'paid' && order.status !== 'partially_refunded') return null;
  return {
    referenceType: 'ticket_order',
    referenceId: order.id,
    serviceStartsAt: order.eventSnapshot.startsAt,
    serviceEndsAt: order.eventSnapshot.endsAt || order.eventSnapshot.startsAt,
  };
}

const ROUND_BUTTON =
  'press w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50';

export function UserTicketsHistoryView({
  onBack,
  renderClaimAction,
}: UserTicketsHistoryViewProps = {}) {
  const { t, i18n } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const { tickets, orders, loading, error, reload } = wallet;
  const actions = useTicketWalletActions(wallet);
  const [activeTab, setActiveTab] = useState<'tickets' | 'orders'>('tickets');
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const now = new Date();

  const askRefund = (order: TicketOrder) => {
    // Só para mostrar antes de confirmar; o valor devolvido é decidido pelo backend.
    const amountMinor = previewOrderRefundMinor(order, now);
    const keepsServiceFee = (order.serviceFeeMinor ?? 0) > 0 && amountMinor < order.totalMinor;
    setConfirm({
      message: [
        t('ticketWallet.refundConfirm', {
          amount: formatMoneyMinor(amountMinor, i18n.language),
        }),
        keepsServiceFee ? t('salesPolicy.serviceFee.notRefundable') : '',
      ]
        .filter(Boolean)
        .join(' '),
      confirmLabel: t('ticketWallet.actions.refund'),
      onCancel: () => setConfirm(null),
      onConfirm: () => {
        setConfirm(null);
        void actions.requestRefund(order);
      },
    });
  };

  const isPendingAndActive = (order: TicketOrder) =>
    (order.status === 'pending_payment' || order.status === 'payment_failed') &&
    (!order.expiresAt || new Date(order.expiresAt).getTime() > now.getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {onBack && <BackButton label={t('ticketWallet.back')} onClick={onBack} />}
          <h2 className="text-[22px] font-display font-bold text-ink">{t('ticketWallet.title')}</h2>
        </div>
        <button
          type="button"
          onClick={() => void reload()}
          aria-label={t('ticketWallet.refresh')}
          className={ROUND_BUTTON}
        >
          <RefreshCw
            size={18}
            className={loading ? 'animate-spin text-accent' : ''}
            aria-hidden="true"
          />
        </button>
      </div>

      <SegmentedControl
        label={t('ticketWallet.tabsLabel')}
        value={activeTab}
        onChange={setActiveTab}
        options={[
          { value: 'tickets', label: t('ticketWallet.tabs.tickets', { count: tickets.length }) },
          { value: 'orders', label: t('ticketWallet.tabs.orders', { count: orders.length }) },
        ]}
      />

      {actions.feedback && (
        <p
          role={actions.feedback.type === 'error' ? 'alert' : 'status'}
          className={cn(
            'p-3 rounded-xl border text-xs flex items-center gap-2',
            actions.feedback.type === 'success'
              ? 'bg-success-soft border-success-line text-success'
              : 'bg-danger-soft border-danger-line text-danger'
          )}
        >
          {actions.feedback.type === 'success' ? (
            <CheckCircle2 size={16} className="shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
          )}
          {actions.feedback.message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="p-3 rounded-xl bg-danger-soft border border-danger-line text-xs text-danger"
        >
          {error}
        </p>
      )}

      {loading && tickets.length === 0 && orders.length === 0 ? (
        <p role="status" className="p-8 flex items-center justify-center gap-2 text-ink/70 text-xs">
          <Loader2 size={18} className="animate-spin text-teal-400" aria-hidden="true" />
          {t('ticketWallet.loading')}
        </p>
      ) : activeTab === 'tickets' ? (
        tickets.length === 0 ? (
          <GlassCard className="p-6 text-center space-y-2">
            <TicketIcon size={28} className="mx-auto text-ink/60" aria-hidden="true" />
            <p className="text-sm font-bold text-ink/80">{t('ticketWallet.emptyTickets')}</p>
            <p className="text-xs text-ink/70">{t('ticketWallet.emptyTicketsHint')}</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tickets.map((ticket) => (
              <WalletTicketCard
                key={ticket.id}
                ticket={ticket}
                qrDataUrl={
                  actions.qrPreview?.ticketId === ticket.id ? actions.qrPreview.dataUrl : undefined
                }
                canTransfer={canTransferTicket(
                  ticket,
                  orders.find((order) => order.id === ticket.orderId),
                  now
                )}
                busy={actions.busy}
                onShowQr={() => void actions.showQr(ticket)}
                onReissueQr={() => void actions.reissueQr(ticket)}
                onTransfer={() => actions.setTransferTicket(ticket)}
              />
            ))}
          </div>
        )
      ) : orders.length === 0 ? (
        <GlassCard className="p-6 text-center space-y-2">
          <p className="text-sm font-bold text-ink/80">{t('ticketWallet.emptyOrders')}</p>
          <p className="text-xs text-ink/70">{t('ticketWallet.emptyOrdersHint')}</p>
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const claimSale = renderClaimAction ? claimSaleOf(order) : null;
            return (
              <WalletOrderCard
                key={order.id}
                order={order}
                ticketCount={tickets.filter((ticket) => ticket.orderId === order.id).length}
                canResume={isPendingAndActive(order)}
                canRefund={canRequestRefund(order, tickets, now)}
                busy={actions.busy}
                onResume={() => void actions.resumePayment(order)}
                onRefund={() => askRefund(order)}
                claimAction={claimSale && renderClaimAction?.(claimSale)}
              />
            );
          })}
        </ul>
      )}

      {actions.resumingOrder && (
        <ResumePaymentCard
          resuming={actions.resumingOrder}
          onClose={() => actions.setResumingOrder(null)}
          onError={(message) => actions.setFeedback({ type: 'error', message })}
          onPaid={async () => {
            actions.setResumingOrder(null);
            await reload();
            actions.setFeedback({ type: 'success', message: t('ticketWallet.feedback.paid') });
          }}
        />
      )}

      {actions.transferTicket && (
        <TransferTicketForm
          ticket={actions.transferTicket}
          busy={actions.busy}
          onSubmit={(recipient) => void actions.submitTransfer(recipient)}
          onCancel={() => actions.setTransferTicket(null)}
        />
      )}

      <ConfirmDialog data={confirm} />
    </div>
  );
}
