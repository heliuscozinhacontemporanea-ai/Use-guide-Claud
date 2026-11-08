import { ticketingAdapter } from '../../factory';

export function createTransferLinkUseCase(ticketId: string) {
  return ticketingAdapter.createTransferLink(ticketId);
}
