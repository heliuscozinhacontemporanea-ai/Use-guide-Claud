import { eventsAdapter } from '../../factory';

export async function archiveAdminEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.archiveAdminEventListing(id);
}
