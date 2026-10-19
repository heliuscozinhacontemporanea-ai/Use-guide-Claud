import { eventOccurrencesService } from '../factory';
import type { EventActorContext } from '../services/eventsService';

export async function deleteEventOccurrenceUseCase(
  actor: EventActorContext,
  occurrenceId: string,
  hasCommercialHistory = false
): Promise<{ mode: 'deleted' | 'canceled' }> {
  return eventOccurrencesService.deleteOccurrence(actor, occurrenceId, hasCommercialHistory);
}
