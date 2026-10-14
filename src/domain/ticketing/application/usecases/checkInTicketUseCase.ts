import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function checkInTicketUseCase(input: Parameters<TicketingPort['checkInTicket']>[0]) {
  return ticketingAdapter.checkInTicket(input);
}
