import { listingPlanAdapter } from '../../factory';
import type { ListingPlanView } from '../../types/listingPlan';

export function activateListingTrialUseCase(itemId: string): Promise<ListingPlanView> {
  return listingPlanAdapter.activateTrial(itemId);
}
