import { ticketingAdapter } from '../../factory';

export function listUserTicketsUseCase() {
  return ticketingAdapter.listUserTickets();
}
