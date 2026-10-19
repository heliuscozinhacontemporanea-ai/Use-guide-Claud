import { eventOccurrencesService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence, UpdateEventOccurrenceInput } from '../types/eventTypes';

export async function updateEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  input: UpdateEventOccurrenceInput,
  committedTicketsCount = 0
): Promise<EventOccurrence> {
  return eventOccurrencesService.updateOccurrence(
    actor,
    occurrenceId,
    input,
    committedTicketsCount
  );
}
