import { eventOccurrencesService } from '../factory';
import type { EventActorContext } from '../services/eventsService';
import type { EventOccurrence } from '../types/eventTypes';

export async function postponeEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  replacement: {
    startsAt: string;
    endsAt: string;
    salesStartsAt?: string;
    salesEndsAt?: string;
    reason: string;
  }
): Promise<{ postponedOccurrence: EventOccurrence; newOccurrence: EventOccurrence }> {
  return eventOccurrencesService.postponeOccurrence(actor, occurrenceId, replacement);
}
