import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventCheckIn, Ticket } from '../types/ticketingTypes';

export async function checkInTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof checkInService.checkInTicket>[1]
): Promise<{ ticket: Ticket; checkIn: EventCheckIn }> {
  return checkInService.checkInTicket(actor, params);
}
