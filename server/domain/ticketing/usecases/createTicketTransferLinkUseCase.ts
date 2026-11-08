import { ticketTransferLinkService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { TicketTransferLink } from '../types/ticketingTypes';

/** Link de transferência (D21): 30 min, uso único, só para ingresso de quem comprou. */
export function createTicketTransferLinkUseCase(
  actor: TicketingActorContext,
  ticketId: string,
  receivedFrom: TicketTransferLink['receivedFrom']
) {
  return ticketTransferLinkService.create(actor, ticketId, receivedFrom);
}
