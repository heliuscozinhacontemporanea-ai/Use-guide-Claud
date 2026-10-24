import { listingPlanAdapter } from '../../factory';
import type { ListingPlanView } from '../../types/listingPlan';

/** Admin concede ou retira o selo do estabelecimento; um plano pago em vigor é mantido (D8). */
export function setListingSealUseCase(itemId: string, grant: boolean): Promise<ListingPlanView> {
  return listingPlanAdapter.setSeal(itemId, grant);
}
