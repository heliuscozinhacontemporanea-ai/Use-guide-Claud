import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing } from '../types/eventTypes';

export async function publishEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.publishListing(actor, id);
}
