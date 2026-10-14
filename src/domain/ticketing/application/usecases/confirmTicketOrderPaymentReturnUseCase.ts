import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function confirmTicketOrderPaymentReturnUseCase(
  orderId: string,
  input: Parameters<TicketingPort['confirmOrderPaymentReturn']>[1]
) {
  return ticketingAdapter.confirmOrderPaymentReturn(orderId, input);
}
