import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function requestTicketRefundUseCase(
  orderId: string,
  input: Parameters<TicketingPort['requestRefund']>[1]
) {
  return ticketingAdapter.requestRefund(orderId, input);
}
