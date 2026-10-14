import { eventsAdapter } from '../../factory';

export async function deleteAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.deleteAdminEventListing(id);
}
