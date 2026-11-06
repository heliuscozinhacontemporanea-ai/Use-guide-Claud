import { courtesyService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventCourtesy } from '../types/courtesyTypes';

/** O organizador cancela a cortesia até a pessoa entrar; o lugar volta para a sessão (D27). */
export function cancelCourtesyUseCase(
  actor: TicketingActorContext,
  courtesyId: string
): Promise<EventCourtesy> {
  return courtesyService.cancel(actor, courtesyId);
}
