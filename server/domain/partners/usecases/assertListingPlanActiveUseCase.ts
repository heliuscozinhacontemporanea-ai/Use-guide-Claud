import { listingPlanService } from '../factory';

export function assertListingPlanActiveUseCase(itemId: string): Promise<void> {
  return listingPlanService.assertPlanActive(itemId);
}
