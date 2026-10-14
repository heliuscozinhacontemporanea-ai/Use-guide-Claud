import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createTicketTypeUseCase(input: Parameters<TicketingPort['createTicketType']>[0]) {
  return ticketingAdapter.createTicketType(input);
}
