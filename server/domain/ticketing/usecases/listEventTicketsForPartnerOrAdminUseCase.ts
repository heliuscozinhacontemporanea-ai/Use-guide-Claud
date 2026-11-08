import { ticketingReportService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Ticket } from '../types/ticketingTypes';

/** Ingressos do evento; só o dono do evento ou admin. */
export async function listEventTicketsForPartnerOrAdminUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<Ticket[]> {
  return ticketingReportService.listEventTicketsForPartnerOrAdmin(actor, eventListingId);
}
