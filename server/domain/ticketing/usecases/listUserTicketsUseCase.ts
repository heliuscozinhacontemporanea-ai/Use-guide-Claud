import { ticketOrderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Ticket } from '../types/ticketingTypes';

export async function listUserTicketsUseCase(actor: TicketingActorContext): Promise<Ticket[]> {
  return ticketOrderService.listUserTickets(actor);
}
