import { promoterAdapter } from '../../factory';

export function endPromoterUseCase(promoterId: string) {
  return promoterAdapter.endPromoter(promoterId);
}
