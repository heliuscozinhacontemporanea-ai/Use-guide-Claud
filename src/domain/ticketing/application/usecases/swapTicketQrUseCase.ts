import { ticketingAdapter } from '../../factory';

/** "Problema com o QR Code?": troca única do QR e do código pelo titular (D21). */
export function swapTicketQrUseCase(ticketId: string) {
  return ticketingAdapter.swapTicketQr(ticketId);
}
