import {
  listTicketTypesForManagementUseCase,
  type TicketingActorContext,
} from '../../domain/ticketing';

/** Ingressos vendidos e reservados da sessão, sem as cortesias (D27): o "vendidos" das telas. */
export async function getSoldTicketsCountForOccurrenceApplicationUseCase(
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
