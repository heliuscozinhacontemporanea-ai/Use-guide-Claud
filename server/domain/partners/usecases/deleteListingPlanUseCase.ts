import { listingPlanService } from '../factory';

export function deleteListingPlanUseCase(itemId: string): Promise<void> {
  return listingPlanService.deleteForListing(itemId);
}
