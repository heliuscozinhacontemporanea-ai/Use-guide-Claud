import { eventsAdapter } from '../../factory';
import type { EventListing } from '../../types/event';

export async function getEventListingByIdUseCase(id: string): Promise<EventListing | null> {
  return eventsAdapter.getEventListingById(id);
}
