import { listingPlanService } from '../factory';
import type { PlanListing } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function assertListingPlanPurchasableUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<void> {
  return listingPlanService.assertCanPurchase(actor, listing, verification);
}
