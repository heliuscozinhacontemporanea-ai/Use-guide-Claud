import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventPromoCode } from '../types/ticketingTypes';

export async function createEventPromoCodeUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createPromoCode>[1]
): Promise<EventPromoCode> {
  return ticketingService.createPromoCode(actor, input);
}
