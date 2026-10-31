import { getEventListingByIdUseCase, getEventOccurrenceByIdUseCase } from '../../events';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingPort } from '../ports/ticketingPort';
import type { Ticket, TicketOrder } from '../types/ticketingTypes';

const HOUR_MS = 60 * 60 * 1000;
const DEFAULT_CUTOFF_HOURS = 4;

/**
 * Pedido, evento e sessão do ingresso, já conferindo se a transferência é permitida agora: política
 * do evento, sessão agendada e prazo antes do início. Usado pela transferência e pelo link (D21).
 */
export async function loadTransferContext(
  port: TicketingPort,
  ticket: Ticket,
  nowMs = Date.now()
): Promise<{ order: TicketOrder | null }> {
  const [order, listing, occurrence] = await Promise.all([
    port.getOrderById(ticket.orderId),
    getEventListingByIdUseCase(ticket.eventListingId),
    getEventOccurrenceByIdUseCase(ticket.occurrenceId),
  ]);

  const allowTransfer =
    order?.salesPolicySnapshot.allowTicketTransfer ??
    listing?.salesPolicy.allowTicketTransfer ??
    true;
  if (!allowTransfer) {
    throw new TicketingDomainError(
      'UNPROCESSABLE_ENTITY',
      'A política deste evento não permite transferência de titularidade.'
    );
  }

  if (occurrence) {
    if (occurrence.status !== 'scheduled') {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        'Não é possível transferir ingressos de uma sessão encerrada ou cancelada.'
      );
    }
    const cutoffHours =
      order?.salesPolicySnapshot.ticketTransferCutoffHours ??
      listing?.salesPolicy.ticketTransferCutoffHours ??
      DEFAULT_CUTOFF_HOURS;
    if ((new Date(occurrence.startsAt).getTime() - nowMs) / HOUR_MS < cutoffHours) {
      throw new TicketingDomainError(
        'UNPROCESSABLE_ENTITY',
        `O prazo limite para transferência de titularidade encerrou (${cutoffHours}h antes do início do evento).`
      );
    }
  }
  return { order: order ?? null };
}
