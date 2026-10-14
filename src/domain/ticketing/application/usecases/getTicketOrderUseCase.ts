import { ticketingAdapter } from '../../factory';

export function getTicketOrderUseCase(orderId: string) {
  return ticketingAdapter.getOrder(orderId);
}
