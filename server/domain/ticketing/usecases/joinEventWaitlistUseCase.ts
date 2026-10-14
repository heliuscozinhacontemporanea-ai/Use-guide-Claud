import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { EventWaitlistEntry } from '../types/ticketingTypes';

export async function joinEventWaitlistUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.joinWaitlist>[1]
): Promise<EventWaitlistEntry> {
  return ticketingService.joinWaitlist(actor, input);
}
