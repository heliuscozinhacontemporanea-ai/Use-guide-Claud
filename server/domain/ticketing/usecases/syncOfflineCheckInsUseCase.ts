import { ticketingService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingService';
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
  return ticketingService.syncOfflineCheckInEvents(actor, params);
}
