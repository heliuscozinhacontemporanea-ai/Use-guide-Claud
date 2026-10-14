import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Ticket, TicketOrder, TicketOrderItem } from '../types/ticketingTypes';

export async function createTicketOrderUseCase(
  actor: TicketingActorContext,
  input: Parameters<typeof ticketingService.createTicketOrder>[1]
): Promise<{
  order: TicketOrder;
  items: TicketOrderItem[];
  issuedTickets: Array<{ ticket: Ticket; rawQrToken?: string }>;
  isIdempotentReplay: boolean;
  serverNow: string;
}> {
  return ticketingService.createTicketOrder(actor, input);
}
