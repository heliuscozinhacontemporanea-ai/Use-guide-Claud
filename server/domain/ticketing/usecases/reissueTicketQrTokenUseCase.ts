import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

export async function reissueTicketQrTokenUseCase(
  actor: TicketingActorContext,
  ticketId: string
): Promise<{
  ticketId: string;
  token: string;
  expiresAt: string;
  code: string | null;
  codeVisibleFrom: string | null;
}> {
  return checkInService.generateTicketPresentationQr(actor, ticketId);
}
