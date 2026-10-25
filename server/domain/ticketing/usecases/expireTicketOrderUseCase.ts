import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function expireTicketOrderUseCase(orderId: string, actor?: TicketingActorContext) {
  return ticketOrderService.expireTicketOrder(orderId, actor);
}
