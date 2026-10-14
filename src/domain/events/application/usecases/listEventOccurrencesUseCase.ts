import { eventsAdapter } from '../../factory';
import type { EventOccurrence } from '../../types/event';

export async function listEventOccurrencesUseCase(
  eventListingId: string
): Promise<EventOccurrence[]> {
  return eventsAdapter.listEventOccurrences(eventListingId);
}
