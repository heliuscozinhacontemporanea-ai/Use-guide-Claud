import { ticketingAdapter } from '../../factory';

export function listPublicTicketTypesUseCase(occurrenceId: string) {
  return ticketingAdapter.listPublicTicketTypes(occurrenceId);
}
