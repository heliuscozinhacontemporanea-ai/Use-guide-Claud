import type { PurchaseSection } from '../../../ui/components/purchases/purchaseEntry';
import type { TicketOrder } from '../types/ticketing';

const DONE = new Set<TicketOrder['status']>(['paid', 'partially_refunded', 'disputed']);

/** Pedido ainda pode ser pago: pendente ou recusado, dentro da reserva do estoque. */
export function isOrderPayable(order: TicketOrder, now: Date): boolean {
  return (
    (order.status === 'pending_payment' || order.status === 'payment_failed') &&
    (!order.expiresAt || new Date(order.expiresAt).getTime() > now.getTime())
  );
}

/** Seção do pedido no histórico de Compras: pago, esperando pagamento ou sem cobrança/devolvido. */
export function ticketPurchaseSection(order: TicketOrder, now: Date): PurchaseSection {
  if (DONE.has(order.status)) return 'done';
  if (order.status === 'payment_processing' || isOrderPayable(order, now)) return 'pending';
  return 'canceled';
}
