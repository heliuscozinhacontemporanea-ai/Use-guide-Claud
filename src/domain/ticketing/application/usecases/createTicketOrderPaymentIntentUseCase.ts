import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createTicketOrderPaymentIntentUseCase(
  orderId: string,
  input: Parameters<TicketingPort['createOrderPaymentIntent']>[1]
) {
  return ticketingAdapter.createOrderPaymentIntent(orderId, input);
}
