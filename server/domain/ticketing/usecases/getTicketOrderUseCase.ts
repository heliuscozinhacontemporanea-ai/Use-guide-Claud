import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function getTicketOrderUseCase(actor: TicketingActorContext, orderId: string) {
  return ticketOrderService.getOrderForUser(actor, orderId);
}
