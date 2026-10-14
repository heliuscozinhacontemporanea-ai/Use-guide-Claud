import {
  listTicketTypesForManagementUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

export async function getCommittedTicketsCountForOccurrenceApplicationUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<number> {
  try {
    const ticketTypes = await listTicketTypesForManagementUseCase(actor, occurrenceId);
    return ticketTypes.reduce((sum, tt) => sum + tt.soldCount + tt.reservedCount, 0);
  } catch {
    return 0;
  }
}
