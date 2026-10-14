import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function transferTicketUseCase(
  ticketId: string,
  input: Parameters<TicketingPort['transferTicket']>[1]
) {
  return ticketingAdapter.transferTicket(ticketId, input);
}
