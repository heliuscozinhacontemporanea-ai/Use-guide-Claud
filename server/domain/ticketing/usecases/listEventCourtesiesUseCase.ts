import { courtesyService } from '../factory';
import type { CourtesyRow } from '../services/courtesyService';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** Lista de convidados do evento (p13), só para o dono e o admin. */
export function listEventCourtesiesUseCase(
  actor: TicketingActorContext,
  eventListingId: string
): Promise<CourtesyRow[]> {
  return courtesyService.listForEvent(actor, eventListingId);
}
