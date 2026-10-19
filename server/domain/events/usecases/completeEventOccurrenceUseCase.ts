import { eventOccurrencesService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence } from '../types/eventTypes';

export async function completeEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string
): Promise<EventOccurrence> {
  return eventOccurrencesService.completeOccurrence(actor, occurrenceId);
}
