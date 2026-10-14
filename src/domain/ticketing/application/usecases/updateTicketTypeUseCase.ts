import { ticketingAdapter } from '../../factory';
import type { TicketingPort } from '../../ports/ticketingPort';

export function updateTicketTypeUseCase(
  ticketTypeId: string,
  patch: Parameters<TicketingPort['updateTicketType']>[1]
) {
  return ticketingAdapter.updateTicketType(ticketTypeId, patch);
}
