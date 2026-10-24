import { listingPlanService } from '../factory';

export function listActivePlanItemIdsUseCase(limit: number): Promise<string[]> {
  return listingPlanService.listActivePlanItemIds(limit);
}
