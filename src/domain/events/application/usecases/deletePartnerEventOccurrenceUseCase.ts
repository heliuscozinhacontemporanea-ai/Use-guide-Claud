import { eventsAdapter } from '../../factory';

export async function deletePartnerEventOccurrenceUseCase(
  eventListingId: string,
  occurrenceId: string
): Promise<void> {
  return eventsAdapter.deletePartnerEventOccurrence(eventListingId, occurrenceId);
}
