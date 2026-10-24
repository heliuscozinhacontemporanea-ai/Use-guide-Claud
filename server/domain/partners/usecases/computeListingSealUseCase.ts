import { listingPlanService } from '../factory';
import type { ListingSeal } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function computeListingSealUseCase(
  itemId: string,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<ListingSeal> {
  return listingPlanService.computeSeal(itemId, verification);
}
