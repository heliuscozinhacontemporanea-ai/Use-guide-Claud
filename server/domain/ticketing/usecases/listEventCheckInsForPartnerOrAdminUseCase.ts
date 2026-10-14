import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventCheckIn } from '../types/ticketingTypes';

export async function listEventCheckInsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<EventCheckIn[]> {
  return ticketingService.listEventCheckInsForPartnerOrAdmin(actor, eventListingId);
}
