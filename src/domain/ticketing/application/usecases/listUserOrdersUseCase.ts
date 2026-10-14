import { ticketingAdapter } from '../../factory';

export function listUserOrdersUseCase() {
  return ticketingAdapter.listUserOrders();
}
