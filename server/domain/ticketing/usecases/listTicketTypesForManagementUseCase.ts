import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketType } from '../types/ticketingTypes';

export async function listTicketTypesForManagementUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<TicketType[]> {
  return ticketingService.listTicketTypesForManagement(actor, occurrenceId);
}
