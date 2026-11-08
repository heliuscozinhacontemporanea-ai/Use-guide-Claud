import { promoterService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventPromoter } from '../types/promoterTypes';

/** Encerra o link; as vendas feitas até ali continuam contando (D27). */
export function endPromoterUseCase(
  actor: TicketingActorContext,
  promoterId: string
): Promise<EventPromoter> {
  return promoterService.end(actor, promoterId);
}
