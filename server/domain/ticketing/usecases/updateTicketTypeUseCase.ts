import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketType } from '../types/ticketingTypes';

export async function updateTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string,
  patch: Parameters<typeof ticketTypeService.updateTicketType>[2]
): Promise<TicketType> {
  return ticketTypeService.updateTicketType(actor, ticketTypeId, patch);
}
