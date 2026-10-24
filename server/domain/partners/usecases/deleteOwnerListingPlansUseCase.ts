import { listingPlanService } from '../factory';

export function deleteOwnerListingPlansUseCase(ownerId: string): Promise<void> {
  return listingPlanService.deleteForOwner(ownerId);
}
