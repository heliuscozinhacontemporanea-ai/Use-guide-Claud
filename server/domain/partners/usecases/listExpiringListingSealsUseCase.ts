import { listingPlanService } from '../factory';
import type { ListingPlanRecord } from '../types/listingPlan';

export function listExpiringListingSealsUseCase(
  withinDays: number,
  limit: number
): Promise<ListingPlanRecord[]> {
  return listingPlanService.listExpiringWithSeal(withinDays, limit);
}
