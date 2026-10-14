import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function moveOrderToOccurrenceUseCase(
  actor: TicketingActorContext,
  params: {
    fromOccurrenceId: string;
    toOccurrenceId: string;
  }
) {
  return ticketingService.moveOrdersAndTicketsToOccurrence(actor, params);
}
