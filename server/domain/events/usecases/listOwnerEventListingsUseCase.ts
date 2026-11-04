import { eventsService } from '../factory';
import type { EventListing } from '../types/eventTypes';

export async function listOwnerEventListingsUseCase(ownerId: string): Promise<EventListing[]> {
  return eventsService.listListingsByOwner(ownerId);
}
