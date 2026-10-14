import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function getTicketOrderUseCase(actor: TicketingActorContext, orderId: string) {
  return ticketingService.getOrderForUser(actor, orderId);
}
