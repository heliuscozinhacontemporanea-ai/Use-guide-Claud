import { createElement } from 'react';
import { Ticket as TicketIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDay } from '../../../shared/utils/businessDateTime';
import type { PurchaseEntry } from '../../../ui/components/purchases/purchaseEntry';
import type { StatusTone } from '../../../ui/components/StatusText';
import type { TicketOrder } from '../types/ticketing';
import { isOrderPayable, ticketPurchaseSection } from '../utils/ticketPurchaseSection';
import { useTicketWalletActions } from './useTicketWalletActions';
import { useUserTicketsAndOrders } from './useUserTickets';

// Código curto do pedido para o atendimento; o ID completo continua no backend.
export const ORDER_CODE_LENGTH = 10;

const STATUS: Record<TicketOrder['status'], { tone: StatusTone; key: string }> = {
  paid: { tone: 'success', key: 'paid' },
  partially_refunded: { tone: 'muted', key: 'partiallyRefunded' },
  disputed: { tone: 'warn', key: 'disputed' },
  pending_payment: { tone: 'warn', key: 'awaitingPayment' },
  payment_failed: { tone: 'warn', key: 'awaitingPayment' },
  payment_processing: { tone: 'info', key: 'processing' },
  refund_pending: { tone: 'info', key: 'refundPending' },
  refunded: { tone: 'muted', key: 'refunded' },
  canceled: { tone: 'muted', key: 'refunded' },
  expired: { tone: 'muted', key: 'notCompleted' },
};

/** Pedidos de ingresso como linhas do histórico de Compras, com as ações da carteira. */
export function useTicketPurchases() {
  const { t, i18n } = useTranslation();
  const wallet = useUserTicketsAndOrders(true);
  const actions = useTicketWalletActions(wallet);
  const now = new Date();

  const entryOf = (order: TicketOrder): PurchaseEntry => {
    const section = ticketPurchaseSection(order, now);
    const payable = isOrderPayable(order, now);
    const status =
      section === 'canceled' &&
      (order.status === 'pending_payment' || order.status === 'payment_failed')
        ? STATUS.expired
        : STATUS[order.status];
    const event = order.eventSnapshot;
    return {
      key: `ticket:${order.id}`,
      section,
      icon: createElement(TicketIcon, { size: 18, 'aria-hidden': true }),
      title: event?.title ?? t('ticketWallet.order', { id: order.id.slice(0, ORDER_CODE_LENGTH) }),
      code: order.id.slice(0, ORDER_CODE_LENGTH),
      purchasedAt: order.createdAt,
      serviceLine: event
        ? t('purchases.service.event', { date: formatBusinessDay(event.startsAt, i18n.language) })
        : '',
      amountMinor: order.totalMinor,
      struck: section === 'canceled',
      status: {
        tone: status.tone,
        text:
          status.key === 'awaitingPayment' && !order.expiresAt
            ? t('purchases.status.awaitingPaymentNoTime')
            : t(`purchases.status.${status.key}`, {
                time: order.expiresAt
                  ? formatBusinessDate(order.expiresAt, i18n.language, { timeStyle: 'short' })
                  : '',
              }),
      },
      quickAction: payable
        ? {
            label: t('purchases.pay'),
            disabled: actions.busy,
            onClick: () => void actions.resumePayment(order),
          }
        : undefined,
    };
  };

  return {
    ...wallet,
    actions,
    entries: wallet.orders.map(entryOf),
  };
}

export type TicketPurchasesSource = ReturnType<typeof useTicketPurchases>;
