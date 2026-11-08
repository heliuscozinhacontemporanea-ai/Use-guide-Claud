import { promoterAdapter } from '../../factory';

export function respondPromoterInviteUseCase(promoterId: string, accept: boolean) {
  return promoterAdapter.respondPromoterInvite(promoterId, accept);
}
