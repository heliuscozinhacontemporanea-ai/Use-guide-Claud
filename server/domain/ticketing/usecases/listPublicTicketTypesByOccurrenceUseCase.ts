import { ticketTypeService } from '../factory';
import type { PublicTicketTypeProjection } from '../types/ticketingTypes';

export async function listPublicTicketTypesByOccurrenceUseCase(
  occurrenceId: string
): Promise<PublicTicketTypeProjection[]> {
  return ticketTypeService.listPublicTicketTypesByOccurrence(occurrenceId);
}
