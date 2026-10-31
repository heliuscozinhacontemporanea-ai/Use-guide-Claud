import { ticketTransferLinkService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export function cancelTicketTransferLinkUseCase(actor: TicketingActorContext, ticketId: string) {
  return ticketTransferLinkService.cancel(actor, ticketId);
}
