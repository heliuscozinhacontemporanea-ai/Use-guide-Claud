import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listUserTicketOrdersUseCase(
  actor: TicketingActorContext
): Promise<TicketOrder[]> {
  return ticketOrderService.listUserOrders(actor);
}
