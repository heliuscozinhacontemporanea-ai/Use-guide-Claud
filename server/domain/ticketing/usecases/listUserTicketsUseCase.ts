import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Ticket } from '../types/ticketingTypes';

export async function listUserTicketsUseCase(actor: TicketingActorContext): Promise<Ticket[]> {
  return ticketingService.listUserTickets(actor);
}
