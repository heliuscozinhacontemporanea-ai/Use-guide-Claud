import { type BuyerRefund, calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
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
 * Mesma conta do backend (arrependimento, reagendamento ou política do pedido), só para mostrar antes de
 * pedir. A taxa de serviço só volta no arrependimento (D14) e no reagendamento (D16).
 */
export function previewOrderRefund(order: TicketOrder, now: Date): BuyerRefund | null {
  if (order.status !== 'paid' || !order.eventSnapshot?.startsAt || !order.salesPolicySnapshot) {
    return null;
  }
  const serviceFeeMinor = order.serviceFeeMinor ?? 0;
  return calculateBuyerRefund({
    family: 'event',
    policy: order.salesPolicySnapshot.cancellationPolicy,
    purchasedAt: order.paidAt ?? order.createdAt,
    startsAt: order.eventSnapshot.startsAt,
    now,
    paidMinor: order.totalMinor - serviceFeeMinor,
    serviceFeeMinor,
    rescheduledAt: order.rescheduledAt,
  });
}

export function previewOrderRefundMinor(order: TicketOrder, now: Date): number {
  const refund = previewOrderRefund(order, now);
  return refund ? refund.refundMinor + refund.serviceFeeRefundMinor : 0;
}

export function canRequestRefund(order: TicketOrder, tickets: Ticket[], now: Date) {
  const orderTickets = tickets.filter((ticket) => ticket.orderId === order.id);
  if (orderTickets.some((ticket) => ticket.status === 'checked_in')) return false;
  return previewOrderRefundMinor(order, now) > 0;
}
