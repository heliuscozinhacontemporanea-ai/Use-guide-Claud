import { ticketOrderService } from '../factory';
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
  return ticketOrderService.createTicketOrder(actor, input);
}
