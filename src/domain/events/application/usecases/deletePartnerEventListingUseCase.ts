import { eventsAdapter } from '../../factory';

export async function deletePartnerEventListingUseCase(id: string): Promise<void> {
  return eventsAdapter.deletePartnerEventListing(id);
}
