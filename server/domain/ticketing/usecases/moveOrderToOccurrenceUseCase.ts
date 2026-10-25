import { ticketHolderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function moveOrderToOccurrenceUseCase(
  actor: TicketingActorContext,
  params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
  }
) {
  return ticketHolderService.moveOrdersAndTicketsToOccurrence(actor, params);
}
