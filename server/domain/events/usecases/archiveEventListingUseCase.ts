import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing } from '../types/eventTypes';

export async function archiveEventListingUseCase(
  actor: EventActorContext,
  id: string
): Promise<EventListing> {
  return eventsService.archiveListing(actor, id);
}
