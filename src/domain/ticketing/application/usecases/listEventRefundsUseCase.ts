import { ticketingAdapter } from '../../factory';

export function listEventRefundsUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventRefunds(eventListingId, asAdmin);
}
