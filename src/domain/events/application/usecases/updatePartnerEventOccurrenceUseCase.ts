import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function updatePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  input: Partial<CreateEventOccurrenceInput>
): Promise<EventOccurrence> {
  return eventsAdapter.updatePartnerEventOccurrence(eventListingId, occurrenceId, input);
}
