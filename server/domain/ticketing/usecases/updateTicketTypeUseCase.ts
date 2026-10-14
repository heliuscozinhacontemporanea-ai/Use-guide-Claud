import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketType } from '../types/ticketingTypes';

export async function updateTicketTypeUseCase(
  actor: TicketingActorContext,
  ticketTypeId: string,
  patch: Parameters<typeof ticketingService.updateTicketType>[2]
): Promise<TicketType> {
  return ticketingService.updateTicketType(actor, ticketTypeId, patch);
}
