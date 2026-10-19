import { eventOccurrencesService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence } from '../types/eventTypes';

export async function cancelEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  reason?: string
): Promise<EventOccurrence> {
  return eventOccurrencesService.cancelOccurrence(actor, occurrenceId, reason);
}
