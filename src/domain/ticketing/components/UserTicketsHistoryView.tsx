import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../ui/components/BackButton';
import { ListEmpty, ListError, ListLoading } from '../../../ui/components/ListState';
import { SegmentedControl } from '../../../ui/components/SegmentedControl';
import { cn } from '../../../shared/utils/cn';
import { useTicketWalletActions } from '../hooks/useTicketWalletActions';
import { useUserTicketsAndOrders } from '../hooks/useUserTickets';
import type { Ticket } from '../types/ticketing';
import { canTransferTicket } from '../utils/ticketWalletRules';
import { TransferTicketForm } from './wallet/TransferTicketForm';
import { WalletTicketCard } from './wallet/WalletTicketCard';

interface UserTicketsHistoryViewProps {
  onBack?: () => void;
}

const ROUND_BUTTON =
  'press w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink/80 hover:bg-ink/[0.06] focus-visible:ring-2 focus-visible:ring-teal-400/50';

function endsAtOf(ticket: Ticket): number {
  const event = ticket.eventSnapshot;
  return event ? new Date(event.endsAt || event.startsAt).getTime() : Number.POSITIVE_INFINITY;
}

/**
 * Ingressos do comprador por tempo (Próximos e Anteriores), com QR Code e transferência. Pagar,
 * cancelar e relatar ficam em Configurações › Compras.
 */
export function UserTicketsHistoryView({ onBack }: UserTicketsHistoryViewProps = {}) {
  const { t } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const { tickets, orders, loading, error, reload } = wallet;
  const actions = useTicketWalletActions(wallet);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = new Date();
  const upcoming = tickets.filter((ticket) => endsAtOf(ticket) > now.getTime());
  const past = tickets.filter((ticket) => endsAtOf(ticket) <= now.getTime());
  const shown = tab === 'upcoming' ? upcoming : past;

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
        value={tab}
        onChange={setTab}
        options={[
          { value: 'upcoming', label: t('ticketWallet.tabs.upcoming', { count: upcoming.length }) },
          { value: 'past', label: t('ticketWallet.tabs.past', { count: past.length }) },
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

      {error && <ListError message={error} onRetry={() => void reload()} />}

      {loading && tickets.length === 0 ? (
        <ListLoading label={t('ticketWallet.loading')} />
      ) : (
        !error &&
        shown.length === 0 && (
          <ListEmpty
            message={t(
              tab === 'upcoming' ? 'ticketWallet.emptyUpcoming' : 'ticketWallet.emptyPast'
            )}
          />
        )
      )}

      {shown.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shown.map((ticket) => (
            <WalletTicketCard
              key={ticket.id}
              ticket={ticket}
              qr={actions.qrPreview?.ticketId === ticket.id ? actions.qrPreview : undefined}
              canTransfer={canTransferTicket(
                ticket,
                orders.find((order) => order.id === ticket.orderId),
                now
              )}
              busy={actions.busy}
              onShowQr={() => void actions.showQr(ticket)}
              onSwapQr={() => void actions.swapQr(ticket)}
              onTransfer={() => actions.setTransferTicket(ticket)}
            />
          ))}
        </div>
      )}

      {actions.transferTicket && (
        <TransferTicketForm
          ticket={actions.transferTicket}
          onSubmit={actions.submitTransfer}
          onReturn={actions.submitReturn}
          onLinkChanged={actions.reloadWallet}
          onCancel={() => actions.setTransferTicket(null)}
        />
      )}
    </div>
  );
}
