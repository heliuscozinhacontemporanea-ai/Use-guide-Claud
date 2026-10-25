import { offlineCheckInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { OfflineCheckInManifest, OfflineCheckInSession } from '../types/ticketingTypes';

export async function createOfflineCheckInSessionUseCase(
  actor: TicketingActorContext,
  params: { occurrenceId: string; stationId?: string }
): Promise<{
  session: OfflineCheckInSession;
  manifest: OfflineCheckInManifest;
}> {
  return offlineCheckInService.prepareOfflineCheckInSession(actor, params);
}
