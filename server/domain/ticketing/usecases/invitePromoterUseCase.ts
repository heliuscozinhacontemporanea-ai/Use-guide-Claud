import { promoterService } from '../factory';
import type { TicketingActorContext } from '../services/ticketingAccess';
import type { EventPromoter, PromoterEarning } from '../types/promoterTypes';

/** Convite para divulgar o evento (D27): a pessoa só ganha o link depois de aceitar. */
export function invitePromoterUseCase(
  actor: TicketingActorContext,
  eventListingId: string,
  promoter: { uid: string; username: string | null; displayName: string | null },
  earning: PromoterEarning
): Promise<EventPromoter> {
  return promoterService.invite(actor, eventListingId, promoter, earning);
}
