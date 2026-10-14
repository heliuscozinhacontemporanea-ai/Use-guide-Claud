import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventCheckIn, Ticket } from '../types/ticketingTypes';

export async function checkInTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.checkInTicket>[1]
): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
  return ticketingService.checkInTicket(actor, params);
}
