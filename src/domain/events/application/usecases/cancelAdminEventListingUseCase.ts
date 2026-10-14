import { eventsAdapter } from '../../factory';

export async function cancelAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.cancelAdminEventListing(id);
}
