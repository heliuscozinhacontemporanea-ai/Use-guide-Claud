import type { TicketOrder } from '../types/ticketingTypes';

/**
 * Pedido como o dono do evento recebe: dados da venda, sem nome, e-mail, documento nem uid do
 * comprador (AGENTS.md §7.9 regra 4, decisão 1e.2 da D27). O admin continua vendo o pedido inteiro.
 */
export function toPartnerOrderView(order: TicketOrder) {
  return {
    id: order.id,
    eventListingId: order.eventListingId,
    occurrenceId: order.occurrenceId,
    status: order.status,
    currency: order.currency,
    subtotalMinor: order.subtotalMinor,
    discountMinor: order.discountMinor,
    platformFeeMinor: order.platformFeeMinor,
    paymentFeeMinor: order.paymentFeeMinor,
    serviceFeeMinor: order.serviceFeeMinor,
    totalMinor: order.totalMinor,
    paymentMethod: order.paymentMethod,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export type PartnerOrderView = ReturnType<typeof toPartnerOrderView>;
