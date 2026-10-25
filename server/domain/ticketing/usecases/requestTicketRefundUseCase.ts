import { ticketRefundService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Refund, TicketOrder } from '../types/ticketingTypes';

export async function requestTicketRefundUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketRefundService.requestTicketRefund>[1]
): Promise<{ refund: Refund; isReplay: boolean; order: TicketOrder }> {
  return ticketRefundService.requestTicketRefund(actor, params);
}
