import { ticketingAdapter } from '../../factory';

export function cancelTransferLinkUseCase(ticketId: string) {
  return ticketingAdapter.cancelTransferLink(ticketId);
}
