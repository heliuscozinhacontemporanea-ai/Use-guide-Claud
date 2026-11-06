import { courtesyService } from '../factory';
import type { CourtesyRecipient } from '../services/courtesyService';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventCourtesy } from '../types/courtesyTypes';

/** Cortesia pelo @ (D27): o ingresso cai direto na carteira da pessoa. */
export function inviteCourtesyByUsernameUseCase(
  actor: TicketingActorContext,
  occurrenceId: string,
  recipient: CourtesyRecipient
): Promise<EventCourtesy> {
  return courtesyService.inviteByUsername(actor, occurrenceId, recipient);
}
