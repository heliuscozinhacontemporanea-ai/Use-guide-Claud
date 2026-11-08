import { courtesyService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventCourtesy } from '../types/courtesyTypes';

/** Sessão cancelada: as cortesias dela também (D27); devolve as que tinham pessoa. */
export function cancelOccurrenceCourtesiesUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<EventCourtesy[]> {
  return courtesyService.cancelAllForOccurrence(actor, occurrenceId);
}
