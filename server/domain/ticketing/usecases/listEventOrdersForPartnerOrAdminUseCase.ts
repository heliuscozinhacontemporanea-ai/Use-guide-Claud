import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listEventOrdersForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<TicketOrder[]> {
  return ticketingService.listEventOrdersForPartnerOrAdmin(actor, eventListingId);
}
