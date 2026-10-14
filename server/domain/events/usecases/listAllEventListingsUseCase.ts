import { eventsService } from '../factory';
import type { EventListing } from '../types/eventTypes';

export async function listAllEventListingsUseCase(): Promise<EventListing[]> {
  return eventsService.listAllListings();
}
