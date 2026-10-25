import { ticketTypeService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventPromoCode } from '../types/ticketingTypes';

export async function createEventPromoCodeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketTypeService.createPromoCode>[1]
): Promise<EventPromoCode> {
  return ticketTypeService.createPromoCode(actor, input);
}
