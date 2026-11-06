import { courtesyService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** Link pessoal de convite (D27): uso único, vale até o início da sessão e segura o lugar. */
export function createCourtesyLinkUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<{ courtesyId: string; token: string; expiresAt: string }> {
  return courtesyService.createLink(actor, occurrenceId);
}
