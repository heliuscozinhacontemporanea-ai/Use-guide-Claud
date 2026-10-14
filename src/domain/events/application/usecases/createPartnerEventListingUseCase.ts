import { eventsAdapter } from '../../factory';
import type { CreateEventListingInput, EventListing, EventOccurrence } from '../../types/event';

export async function createPartnerEventListingUseCase(
  input: CreateEventListingInput
): Promise<{ id: string; listing?: EventListing; occurrences?: EventOccurrence[] }> {
  return eventsAdapter.createPartnerEventListing(input);
}
