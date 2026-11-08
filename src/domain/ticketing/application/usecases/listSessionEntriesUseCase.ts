import { ticketingAdapter } from '../../factory';
import type { SessionEntry } from '../../types/ticketing';

export function listSessionEntriesUseCase(
  eventListingId: string,
  occurrenceId: string
): Promise<SessionEntry[]> {
  return ticketingAdapter.listSessionEntries(eventListingId, occurrenceId);
}
