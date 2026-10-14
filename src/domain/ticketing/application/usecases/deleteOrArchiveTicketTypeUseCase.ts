import { ticketingAdapter } from '../../factory';

export function deleteOrArchiveTicketTypeUseCase(ticketTypeId: string) {
  return ticketingAdapter.deleteOrArchiveTicketType(ticketTypeId);
}
