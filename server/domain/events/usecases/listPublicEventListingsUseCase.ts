import { eventsService } from '../factory';
import type { EventListing } from '../types/eventTypes';

export async function listPublicEventListingsUseCase(): Promise<EventListing[]> {
  return eventsService.listPublicListings();
}
