import { listingPlanService } from '../factory';
import type { ListingPlanRecord, PlanListing } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function activateListingTrialUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<ListingPlanRecord> {
  return listingPlanService.activateTrial(actor, listing, verification);
}
