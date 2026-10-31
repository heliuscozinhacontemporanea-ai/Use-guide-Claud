import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** "Problema com o QR Code?": troca única do QR e do código pelo titular (D21). */
export function swapTicketQrUseCase(actor: TicketingActorContext, ticketId: string) {
  return checkInService.swapPresentationQr(actor, ticketId);
}
