import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function reissueTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
}> {
  return checkInService.generateTicketPresentationQr(actor, ticketId);
}
