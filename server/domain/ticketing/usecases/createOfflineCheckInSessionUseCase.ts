import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
import type { OfflineCheckInManifest, OfflineCheckInSession } from '../types/ticketingTypes';

export async function createOfflineCheckInSessionUseCase(
  actor: TicketingActorContext,
  params: { occurrenceId: string; stationId?: string }
): Promise<{
  session: OfflineCheckInSession;
  manifest: OfflineCheckInManifest;
}> {
  return ticketingService.prepareOfflineCheckInSession(actor, params);
}
