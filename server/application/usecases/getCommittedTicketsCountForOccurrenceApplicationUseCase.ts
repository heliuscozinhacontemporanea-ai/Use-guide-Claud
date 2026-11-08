import {
  countOccurrenceCourtesiesUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';
import { getSoldTicketsCountForOccurrenceApplicationUseCase } from './getSoldTicketsCountForOccurrenceApplicationUseCase';

/** Lugares ocupados na sessão (vendidos, reservados e cortesias): base de capacidade e exclusão. */
export async function getCommittedTicketsCountForOccurrenceApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<number> {
  const [sold, courtesies] = await Promise.all([
    getSoldTicketsCountForOccurrenceApplicationUseCase(actor, occurrenceId),
    countOccurrenceCourtesiesUseCase(occurrenceId).catch(() => 0),
  ]);
  return sold + courtesies;
}
