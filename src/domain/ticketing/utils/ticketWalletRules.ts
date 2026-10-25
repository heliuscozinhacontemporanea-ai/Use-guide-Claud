import { calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
import type { Ticket, TicketOrder } from '../types/ticketing';

const HOUR_MS = 60 * 60 * 1000;

/** Transferência pela regra gravada na compra; o backend confere de novo. */
export function canTransferTicket(ticket: Ticket, order: TicketOrder | undefined, now: Date) {
  if (ticket.status !== 'issued') return false;
  const policy = order?.salesPolicySnapshot;
  if (policy && !policy.allowTicketTransfer) return false;
  if (!ticket.eventSnapshot?.startsAt) return true;
  const hoursLeft = (new Date(ticket.eventSnapshot.startsAt).getTime() - now.getTime()) / HOUR_MS;
  return hoursLeft >= (policy?.ticketTransferCutoffHours ?? 4);
}

/**
 * Mesma conta do backend (arrependimento ou política do pedido), só para mostrar o valor antes de pedir.
 * A taxa de serviço só volta no arrependimento (D14).
 */
export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
  if (order.status !== 'paid' || !order.eventSnapshot?.startsAt || !order.salesPolicySnapshot) {
    return 0;
  }
  const serviceFeeMinor = order.serviceFeeMinor ?? 0;
  const refund = calculateBuyerRefund({
    family: 'event',
    policy: order.salesPolicySnapshot.cancellationPolicy,
    purchasedAt: order.paidAt ?? order.createdAt,
    startsAt: order.eventSnapshot.startsAt,
    now,
    paidMinor: order.totalMinor - serviceFeeMinor,
    serviceFeeMinor,
  });
  return refund.refundMinor + refund.serviceFeeRefundMinor;
}

export function canRequestRefund(order: TicketOrder, tickets: Ticket[], now: Date) {
  const orderTickets = tickets.filter((ticket) => ticket.orderId === order.id);
  if (orderTickets.some((ticket) => ticket.status === 'checked_in')) return false;
  return previewOrderRefundMinor(order, now) > 0;
}
