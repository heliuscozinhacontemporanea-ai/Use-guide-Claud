import { eventsAdapter } from '../../factory';
import type { UpdateEventListingInput } from '../../types/event';

export async function updatePartnerEventListingUseCase(
  id: string,
  input: UpdateEventListingInput
): Promise<void> {
  return eventsAdapter.updatePartnerEventListing(id, input);
}
