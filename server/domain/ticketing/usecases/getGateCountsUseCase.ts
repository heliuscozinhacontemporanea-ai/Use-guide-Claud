import { checkInService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';

/** Quantos ingressos valem para a sessão e quantos já entraram, para quem opera a portaria (C1). */
export function getGateCountsUseCase(
  actor: TicketingActorContext,
  occurrenceId: string
): Promise<{ total: number; entered: number }> {
  return checkInService.gateCounts(actor, occurrenceId);
}
