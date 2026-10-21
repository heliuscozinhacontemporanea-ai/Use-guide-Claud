import { listingPlanService } from '../factory';

export function setListingSealActiveUseCase(itemId: string, sealActive: boolean): Promise<void> {
  return listingPlanService.setSealActive(itemId, sealActive);
}
