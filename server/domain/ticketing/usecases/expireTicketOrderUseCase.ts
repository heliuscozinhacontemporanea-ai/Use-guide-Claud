import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function expireTicketOrderUseCase(orderId: string, actor?: TicketingActorContext) {
  return ticketingService.expireTicketOrder(orderId, actor);
}
