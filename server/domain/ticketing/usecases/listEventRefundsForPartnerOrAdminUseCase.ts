import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Refund } from '../types/ticketingTypes';

export async function listEventRefundsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<Refund[]> {
  return ticketingReportService.listEventRefundsForPartnerOrAdmin(actor, eventListingId);
}
