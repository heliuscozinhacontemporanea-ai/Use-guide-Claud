import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { Ticket, TicketTransfer } from '../types/ticketingTypes';

export async function transferTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketingService.transferTicket>[1]
): Promise<{
  oldTicket: Ticket;
  newTicket: Ticket;
  transfer: TicketTransfer;
  newRawQrToken: string;
}> {
  return ticketingService.transferTicket(actor, params);
}
