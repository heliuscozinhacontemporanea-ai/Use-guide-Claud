import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';

export async function reissueTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return ticketingService.generateTicketPresentationQr(actor, ticketId);
}
