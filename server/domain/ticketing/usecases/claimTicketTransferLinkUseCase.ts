import { ticketTransferLinkService } from '../factory';

/** Reserva o link para quem aceitou; quem chama faz a transferência e libera se ela falhar (D21). */
export function claimTicketTransferLinkUseCase(linkId: string, token: string, acceptorUid: string) {
  return ticketTransferLinkService.claim(linkId, token, acceptorUid);
}
