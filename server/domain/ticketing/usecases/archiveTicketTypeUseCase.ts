import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function archiveTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string
): Promise<{ mode: 'deleted' | 'archived' }> {
  return ticketingService.archiveOrDeleteTicketType(actor, ticketTypeId);
}
