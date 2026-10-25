import { ticketHolderService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { Ticket, TicketTransfer } from '../types/ticketingTypes';

export async function transferTicketUseCase(
  actor: TicketingActorContext,
  params: Parameters<typeof ticketHolderService.transferTicket>[1]
): Promise<{
  oldTicket: Ticket;
  newTicket: Ticket;
  transfer: TicketTransfer;
  newRawQrToken: string;
}> {
  return ticketHolderService.transferTicket(actor, params);
}
