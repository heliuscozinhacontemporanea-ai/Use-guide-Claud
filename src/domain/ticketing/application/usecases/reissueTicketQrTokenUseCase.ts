import { ticketingAdapter } from '../../factory';

export function reissueTicketQrTokenUseCase(ticketId: string) {
  return ticketingAdapter.reissueTicketQrToken(ticketId);
}
