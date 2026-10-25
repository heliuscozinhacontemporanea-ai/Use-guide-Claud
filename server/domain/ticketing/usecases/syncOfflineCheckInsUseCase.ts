import { offlineCheckInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { OfflineCheckInEvent, OfflineCheckInSyncResultItem } from '../types/ticketingTypes';

export async function syncOfflineCheckInsUseCase(
  actor: TicketingActorContext,
  params: {
    sessionId: string;
    events: OfflineCheckInEvent[];
  }
): Promise<{
  sessionId: string;
  results: OfflineCheckInSyncResultItem[];
}> {
  return offlineCheckInService.syncOfflineCheckInEvents(actor, params);
}
