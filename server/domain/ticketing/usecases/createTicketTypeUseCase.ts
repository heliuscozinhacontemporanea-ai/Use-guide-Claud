import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { TicketType } from '../types/ticketingTypes';

export async function createTicketTypeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createTicketType>[1]
): Promise<TicketType> {
  return ticketingService.createTicketType(actor, input);
}
