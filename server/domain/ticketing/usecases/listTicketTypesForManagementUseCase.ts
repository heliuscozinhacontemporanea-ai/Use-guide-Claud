import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketType } from '../types/ticketingTypes';

export async function listTicketTypesForManagementUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<TicketType[]> {
  return ticketTypeService.listTicketTypesForManagement(actor, occurrenceId);
}
