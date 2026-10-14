import { eventsAdapter } from '../../factory';
import type { UpdateEventListingInput } from '../../types/event';

export async function updateAdminEventListingUseCase(
  id: string,
  input: UpdateEventListingInput
): Promise<void> {
  return eventsAdapter.updateAdminEventListing(id, input);
}
