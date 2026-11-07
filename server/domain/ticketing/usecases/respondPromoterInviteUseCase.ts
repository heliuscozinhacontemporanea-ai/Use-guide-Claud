import { promoterService } from '../factory';
import type { EventPromoter } from '../types/promoterTypes';

/** Aceite ou recusa do convite, só pela pessoa convidada (D27). */
export function respondPromoterInviteUseCase(
  uid: string,
  promoterId: string,
  accept: boolean
): Promise<EventPromoter> {
  return promoterService.respond(uid, promoterId, accept);
}
