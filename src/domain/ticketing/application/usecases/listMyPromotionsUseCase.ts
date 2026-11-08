import { promoterAdapter } from '../../factory';

export function listMyPromotionsUseCase() {
  return promoterAdapter.listMyPromotions();
}
