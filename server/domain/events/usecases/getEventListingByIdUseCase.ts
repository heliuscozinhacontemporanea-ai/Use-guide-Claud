import { eventsService } from '../factory';
import type { EventListing } from '../types/eventTypes';

export async function getEventListingByIdUseCase(id: string): Promise<EventListing | null> {
  return eventsService.getListingById(id);
}
