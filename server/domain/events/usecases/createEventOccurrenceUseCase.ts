import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { CreateEventOccurrenceInput, EventOccurrence } from '../types/eventTypes';

export async function createEventOccurrenceUseCase(
  actor: EventActorContext,
  input: CreateEventOccurrenceInput
): Promise<EventOccurrence> {
  return eventsService.createOccurrence(actor, input);
}
