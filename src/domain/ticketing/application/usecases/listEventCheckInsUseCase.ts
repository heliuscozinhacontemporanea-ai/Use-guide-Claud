import { ticketingAdapter } from '../../factory';

export function listEventCheckInsUseCase(eventListingId: string, asAdmin = false) {
  return ticketingAdapter.listEventCheckIns(eventListingId, asAdmin);
}
