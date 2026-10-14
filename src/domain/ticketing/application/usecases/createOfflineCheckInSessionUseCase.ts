import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function createOfflineCheckInSessionUseCase(
  input: Parameters<TicketingPort['createOfflineCheckInSession']>[0]
) {
  return ticketingAdapter.createOfflineCheckInSession(input);
}
