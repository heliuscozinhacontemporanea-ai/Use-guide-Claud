import { listingPlanService } from '../factory';
import type { ListingPlanRecord } from '../types/listingPlan';

export function listExpiredListingSealsUseCase(limit: number): Promise<ListingPlanRecord[]> {
  return listingPlanService.listExpiredWithSeal(limit);
}
