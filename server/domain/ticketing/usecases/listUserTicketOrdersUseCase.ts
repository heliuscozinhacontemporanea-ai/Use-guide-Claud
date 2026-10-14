import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listUserTicketOrdersUseCase(
  actor: TicketingActorContext
): Promise<TicketOrder[]> {
  return ticketingService.listUserOrders(actor);
}
