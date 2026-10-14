import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Refund } from '../types/ticketingTypes';

export async function listEventRefundsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<Refund[]> {
  return ticketingService.listEventRefundsForPartnerOrAdmin(actor, eventListingId);
}
