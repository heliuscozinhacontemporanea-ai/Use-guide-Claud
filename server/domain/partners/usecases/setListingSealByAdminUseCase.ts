import { listingPlanService } from '../factory';
import type { PlanListing } from '../types/listingPlan';

export function setListingSealByAdminUseCase(
  actor: { uid: string; admin?: boolean },
  listing: PlanListing,
  grant: boolean
): Promise<void> {
  return listingPlanService.setAdminSeal(actor, listing, grant);
}
