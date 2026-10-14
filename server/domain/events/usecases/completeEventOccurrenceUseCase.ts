import { eventsService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence } from '../types/eventTypes';

export async function completeEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string
): Promise<EventOccurrence> {
  return eventsService.completeOccurrence(actor, occurrenceId);
}
