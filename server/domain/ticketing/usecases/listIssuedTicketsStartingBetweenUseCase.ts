import { ticketHolderService } from '../factory';
import type { Ticket } from '../types/ticketingTypes';

export function listIssuedTicketsStartingBetweenUseCase(
  fromIso: string,
  toIso: string
): Promise<Ticket[]> {
  return ticketHolderService.listIssuedTicketsStartingBetween(fromIso, toIso);
}
