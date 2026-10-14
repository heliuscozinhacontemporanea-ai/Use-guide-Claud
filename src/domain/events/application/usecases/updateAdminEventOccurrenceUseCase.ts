import { eventsAdapter } from '../../factory';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../../types/event';

export async function updateAdminEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string,
  input: Partial<CreateEventOccurrenceInput>
): Promise<EventOccurrence> {
  return eventsAdapter.updateAdminEventOccurrence(eventListingId, occurrenceId, input);
}
