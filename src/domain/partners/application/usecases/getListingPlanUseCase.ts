import { listingPlanAdapter } from '../../factory';
import type { ListingPlanView } from '../../types/listingPlan';

export function getListingPlanUseCase(itemId: string): Promise<ListingPlanView> {
  return listingPlanAdapter.get(itemId);
}
