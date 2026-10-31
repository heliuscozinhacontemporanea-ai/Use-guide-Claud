import { ticketingAdapter } from '../../factory';

export function returnTicketToBuyerUseCase(ticketId: string) {
  return ticketingAdapter.returnTicketToBuyer(ticketId);
}
