import { eventsService } from '../factory';
import type { EventOccurrence } from '../types/eventTypes';

export async function listEventOccurrencesUseCase(
  eventListingId: string,
  options?: { publicOnly?: boolean }
): Promise<EventOccurrence[]> {
  return eventsService.listOccurrencesByListingId(eventListingId, options);
}
