import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventCheckIn } from '../types/ticketingTypes';

export async function listEventCheckInsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<EventCheckIn[]> {
  return ticketingReportService.listEventCheckInsForPartnerOrAdmin(actor, eventListingId);
}
