import type { Refund, Ticket, TicketOrder } from '../types/ticketingTypes';
import type { PromoterSaleInput } from '../types/promoterTypes';

// Pedidos que nunca viraram venda não contam (D27).
const NOT_A_SALE = new Set([
  'pending_payment',
  'payment_processing',
  'payment_failed',
  'expired',
  'canceled',
  'chargeback',
]);

/**
 * Vendas pelo link de cada divulgador: valor pago pelos ingressos (com cupom, sem a taxa de
 * serviço) menos o que voltou ao comprador, e os ingressos que continuam valendo.
 */
export function promoterSalesFromOrders(
  orders: TicketOrder[],
  tickets: Ticket[],
  refunds: Refund[]
): Map<string, PromoterSaleInput> {
  const validTickets = new Map<string, number>();
  for (const ticket of tickets) {
    if (ticket.status === 'issued' || ticket.status === 'checked_in') {
      validTickets.set(ticket.orderId, (validTickets.get(ticket.orderId) ?? 0) + 1);
    }
  }
  const refunded = new Map<string, number>();
  for (const refund of refunds) {
    if (refund.status !== 'approved') continue;
    const ticketsPart = Math.max(0, refund.amountMinor - refund.serviceFeeMinor);
    refunded.set(refund.orderId, (refunded.get(refund.orderId) ?? 0) + ticketsPart);
  }
  const byPromoter = new Map<string, PromoterSaleInput>();
  for (const order of orders) {
    if (!order.promoterId || NOT_A_SALE.has(order.status)) continue;
    const paid = Math.max(0, order.subtotalMinor - order.discountMinor);
    const net = Math.max(0, paid - (refunded.get(order.id) ?? 0));
    const row = byPromoter.get(order.promoterId) ?? {
      promoterId: order.promoterId,
      netTicketsMinor: 0,
      tickets: 0,
    };
    row.netTicketsMinor += net;
    row.tickets += validTickets.get(order.id) ?? 0;
    byPromoter.set(order.promoterId, row);
  }
  return byPromoter;
}
