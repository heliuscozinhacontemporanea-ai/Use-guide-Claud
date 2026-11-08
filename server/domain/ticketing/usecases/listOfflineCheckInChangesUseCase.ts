import { offlineCheckInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** Mudanças da sessão desde a última atualização da lista sem internet (D21). */
export function listOfflineCheckInChangesUseCase(
  actor: TicketingActorContext,
  params: { sessionId: string; since: string }
) {
  return offlineCheckInService.listOfflineChanges(actor, params);
}
