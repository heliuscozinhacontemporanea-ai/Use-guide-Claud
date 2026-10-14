import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing } from '../types/eventTypes';

export async function duplicateEventListingUseCase(
  actor: EventActorContext,
  sourceEventId: string
): Promise<EventListing> {
  return eventsService.duplicateListing(actor, sourceEventId);
}
