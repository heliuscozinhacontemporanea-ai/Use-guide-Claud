import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketOrder } from '../types/ticketingTypes';

export async function listEventOrdersForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<TicketOrder[]> {
  return ticketingReportService.listEventOrdersForPartnerOrAdmin(actor, eventListingId);
}
