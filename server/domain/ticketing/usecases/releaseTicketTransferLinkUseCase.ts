import { ticketTransferLinkService } from '../factory';

export function releaseTicketTransferLinkUseCase(linkId: string) {
  return ticketTransferLinkService.release(linkId);
}
