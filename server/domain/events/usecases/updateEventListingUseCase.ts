import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventListing, UpdateEventListingInput } from '../types/eventTypes';

export async function updateEventListingUseCase(
  actor: EventActorContext,
  id: string,
  input: UpdateEventListingInput,
  options?: { hasCommercialHistory?: boolean }
): Promise<EventListing> {
  return eventsService.updateListing(actor, id, input, options);
}
