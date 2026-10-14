import { ticketingAdapter } from '../../factory';

export function expireTicketOrderUseCase(orderId: string) {
  return ticketingAdapter.expireOrder(orderId);
}
