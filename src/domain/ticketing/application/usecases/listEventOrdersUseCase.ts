import { ticketingAdapter } from '../../factory';

export function listEventOrdersUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventOrders(eventListingId, asAdmin);
}
