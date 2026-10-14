import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type {
  CreateEventListingInput,
  CreateEventOccurrenceInput,
  EventListing,
  EventOccurrence,
} from '../types/eventTypes';

export async function createEventListingUseCase(
  actor: EventActorContext,
  input: Omit<CreateEventListingInput, 'ownerId'> & {
    occurrences?: Array<Omit<CreateEventOccurrenceInput, 'eventListingId'>>;
  }
): Promise<{ listing: EventListing; occurrences: EventOccurrence[] }> {
  return eventsService.createListing(actor, input);
}
