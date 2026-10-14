import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createTicketOrderUseCase(input: Parameters<TicketingPort['createOrder']>[0]) {
  return ticketingAdapter.createOrder(input);
}
