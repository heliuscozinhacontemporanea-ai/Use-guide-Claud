import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../ui/components/ListState';
import { SegmentedControl } from '../../../ui/components/SegmentedControl';
import { StatusText } from '../../../ui/components/StatusText';
import { useTicketWalletActions } from '../hooks/useTicketWalletActions';
import { useUserTicketsAndOrders } from '../hooks/useUserTickets';
import type { Ticket } from '../types/ticketing';
import { canTransferTicket } from '../utils/ticketWalletRules';
import { TransferTicketForm } from './wallet/TransferTicketForm';
import { WalletTicketCard } from './wallet/WalletTicketCard';

function endsAtOf(ticket: Ticket): number {
  const event = ticket.eventSnapshot;
  return event ? new Date(event.endsAt || event.startsAt).getTime() : Number.POSITIVE_INFINITY;
}

/**
 * Ingressos do comprador por tempo (Próximos e Anteriores), com QR Code e transferência. Pagar,
 * cancelar e relatar ficam em Configurações › Compras. O título fica na barra fixa da folha do
 * perfil (D33).
 */
export function UserTicketsHistoryView() {
  const { t } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const { tickets, orders, loading, error, reload } = wallet;
  const actions = useTicketWalletActions(wallet);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const now = new Date();
  const upcoming = tickets.filter((ticket) => endsAtOf(ticket) > now.getTime());
  const past = tickets.filter((ticket) => endsAtOf(ticket) <= now.getTime());
  const shown = tab === 'upcoming' ? upcoming : past;

  // A lista vem da API ao abrir (ingresso é dado privado, AGENTS.md §6.2). Ingresso que chega com a tela
  // aberta (transferência, Pix confirmado) aparece quando a pessoa volta ao app.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);

  return (
    <div className="space-y-4">
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
        <p role={actions.feedback.type === 'error' ? 'alert' : 'status'} className="px-1">
          <StatusText tone={actions.feedback.type === 'success' ? 'success' : 'danger'}>
            {actions.feedback.message}
          </StatusText>
        </p>
      )}

      {error && <ListError message={t('ticketWallet.loadError')} onRetry={() => void reload()} />}

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
