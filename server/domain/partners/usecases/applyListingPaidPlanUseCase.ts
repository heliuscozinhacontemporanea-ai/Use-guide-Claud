import { listingPlanService } from '../factory';
import type { ListingPlanRecord, PaidListingPlanType, PlanListing } from '../types/listingPlan';

export function applyListingPaidPlanUseCase(
  listing: PlanListing,
  planType: PaidListingPlanType,
  planUntil: string
): Promise<ListingPlanRecord> {
  return listingPlanService.applyPaidPlan(listing, planType, planUntil);
}
