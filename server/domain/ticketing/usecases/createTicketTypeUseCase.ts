import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketType } from '../types/ticketingTypes';

export async function createTicketTypeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketTypeService.createTicketType>[1]
): Promise<TicketType> {
  return ticketTypeService.createTicketType(actor, input);
}
