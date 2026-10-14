import { ticketingAdapter } from '../../factory';

export function listManagementTicketTypesUseCase(occurrenceId: string) {
  return ticketingAdapter.listManagementTicketTypes(occurrenceId);
}
