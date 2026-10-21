import { listingPlanService } from '../factory';
import type { ListingPlanView, PlanListing } from '../types/listingPlan';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function getListingPlanViewUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  verification: ListingVerificationStatus | 'not_submitted'
): Promise<ListingPlanView> {
  return listingPlanService.getView(actor, listing, verification);
}
