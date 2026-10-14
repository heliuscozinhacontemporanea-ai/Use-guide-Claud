import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function createPartnerEventOccurrenceUseCase(
  eventListingId: string,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsAdapter.createPartnerEventOccurrence(eventListingId, input);
}
