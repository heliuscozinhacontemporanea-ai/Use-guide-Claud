import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function syncOfflineCheckInsUseCase(
  input: Parameters<TicketingPort['syncOfflineCheckIns']>[0]
) {
  return ticketingAdapter.syncOfflineCheckIns(input);
}
