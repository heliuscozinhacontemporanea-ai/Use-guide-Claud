import { eventOccurrencesService } from '../factory';
import type { EventOccurrence } from '../types/eventTypes';

export async function getEventOccurrenceByIdUseCase(
  occurrenceId: string
): Promise<EventOccurrence | null> {
  return eventOccurrencesService.getOccurrenceById(occurrenceId);
}
