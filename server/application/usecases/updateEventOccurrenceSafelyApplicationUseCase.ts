import {
  updateEventOccurrenceUseCase,
  type EventOccurrence,
  type UpdateEventOccurrenceInput,
} from '../../domain/events';
import type { TicketingActorContext } from '../../domain/ticketing';
import { getCommittedTicketsCountForOccurrenceApplicationUseCase } from './getCommittedTicketsCountForOccurrenceApplicationUseCase';

export async function updateEventOccurrenceSafelyApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  input: UpdateEventOccurrenceInput
): Promise<EventOccurrence> {
  const committedCount = await getCommittedTicketsCountForOccurrenceApplicationUseCase(
    actor,
    occurrenceId
  );
  return updateEventOccurrenceUseCase(actor, occurrenceId, input, committedCount);
}
