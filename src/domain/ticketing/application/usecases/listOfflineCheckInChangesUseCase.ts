import { ticketingAdapter } from '../../factory';

export function listOfflineCheckInChangesUseCase(sessionId: string, since: string) {
  return ticketingAdapter.listOfflineCheckInChanges(sessionId, since);
}
