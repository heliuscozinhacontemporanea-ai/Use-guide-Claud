import { ticketHolderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventWaitlistEntry } from '../types/ticketingTypes';

export async function joinEventWaitlistUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketHolderService.joinWaitlist>[1]
): Promise<EventWaitlistEntry> {
  return ticketHolderService.joinWaitlist(actor, input);
}
