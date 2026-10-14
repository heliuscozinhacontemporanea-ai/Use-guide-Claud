import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function createAdminEventOccurrenceUseCase(
  eventListingId: string,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsAdapter.createAdminEventOccurrence(eventListingId, input);
}
