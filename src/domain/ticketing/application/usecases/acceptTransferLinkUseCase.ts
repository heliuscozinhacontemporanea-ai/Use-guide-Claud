import { ticketingAdapter } from '../../factory';

export function acceptTransferLinkUseCase(linkId: string, token: string) {
  return ticketingAdapter.acceptTransferLink(linkId, token);
}
