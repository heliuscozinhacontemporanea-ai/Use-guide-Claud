import { ticketHolderService } from '../factory';
import type { Ticket } from '../types/ticketingTypes';

export function listCheckedInTicketsEndedBetweenUseCase(
  fromIso: string,
  toIso: string
): Promise<Ticket[]> {
  return ticketHolderService.listCheckedInTicketsEndedBetween(fromIso, toIso);
}
