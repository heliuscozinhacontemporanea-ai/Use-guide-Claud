import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Refund, TicketOrder } from '../types/ticketingTypes';

export async function requestTicketRefundUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.requestTicketRefund>[1]
): Promise<{ refund: Refund; isReplay: boolean; order: TicketOrder }> {
  return ticketingService.requestTicketRefund(actor, params);
}
