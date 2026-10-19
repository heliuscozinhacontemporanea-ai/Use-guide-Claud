import { eventOccurrencesService } from '../factory';
import type { EventOccurrence } from '../types/eventTypes';

export async function listEventOccurrencesUseCase(
  eventListingId: string,
  options?: { publicOnly?: boolean }
): Promise<EventOccurrence[]> {
  return eventOccurrencesService.listOccurrencesByListingId(eventListingId, options);
}
