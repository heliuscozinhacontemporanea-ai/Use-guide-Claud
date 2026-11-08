import { ticketingAdapter } from '../../factory';

export function previewTransferLinkUseCase(linkId: string, token: string) {
  return ticketingAdapter.previewTransferLink(linkId, token);
}
