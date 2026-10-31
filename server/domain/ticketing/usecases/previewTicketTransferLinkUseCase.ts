import { ticketTransferLinkService } from '../factory';

/** O que o link entrega (evento, tipo de ingresso, de quem), antes de aceitar (D21). */
export function previewTicketTransferLinkUseCase(linkId: string, token: string) {
  return ticketTransferLinkService.preview(linkId, token);
}
