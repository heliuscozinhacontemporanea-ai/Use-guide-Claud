import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function archiveTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  return ticketTypeService.archiveOrDeleteTicketType(actor, ticketTypeId);
}
