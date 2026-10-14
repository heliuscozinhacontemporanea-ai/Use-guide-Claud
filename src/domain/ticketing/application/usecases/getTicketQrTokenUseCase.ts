import { ticketingAdapter } from '../../factory';

export function getTicketQrTokenUseCase(ticketId: string) {
  return ticketingAdapter.getTicketQrToken(ticketId);
}
