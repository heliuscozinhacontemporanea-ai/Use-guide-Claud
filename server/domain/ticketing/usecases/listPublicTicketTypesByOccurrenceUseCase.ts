import { ticketingService } from '../factory';
import type { PublicTicketTypeProjection } from '../types/ticketingTypes';

export async function listPublicTicketTypesByOccurrenceUseCase(
  occurrenceId: string
): Promise<PublicTicketTypeProjection[]> {
  return ticketingService.listPublicTicketTypesByOccurrence(occurrenceId);
}
