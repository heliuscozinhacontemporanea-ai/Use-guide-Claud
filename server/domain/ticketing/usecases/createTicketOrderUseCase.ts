import { ticketOrderService } from '../factory';
import { TicketingDomainError } from '../errors/ticketingDomainError';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Ticket, TicketOrder, TicketOrderItem } from '../types/ticketingTypes';

export async function createTicketOrderUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketOrderService.createTicketOrder>[1]
): Promise<{
  order: TicketOrder;
  items: TicketOrderItem[];
  issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
  isIdempotentReplay: boolean;
  serverNow: string;
}> {
  if (actor.emailVerified !== true) {
    throw new TicketingDomainError(
      'EMAIL_NOT_VERIFIED',
      'Confirme seu e-mail antes de comprar ingressos.'
    );
  }
  return ticketOrderService.createTicketOrder(actor, input);
}
