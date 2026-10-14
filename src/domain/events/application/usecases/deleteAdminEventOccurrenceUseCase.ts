import { eventsAdapter } from '../../factory';

export async function deleteAdminEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string
): Promise<void> {
  return eventsAdapter.deleteAdminEventOccurrence(eventListingId, occurrenceId);
}
