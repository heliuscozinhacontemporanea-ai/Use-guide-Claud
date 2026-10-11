import { guideService } from '../factory';
import type { GuideItemRecord } from '../types/guideTypes';

export async function listPublicGuideItemsUseCase(): Promise<GuideItemRecord[]> {
  const items = await guideService.getAllItems();
  return items.filter((item) => item.isActive === true);
}
