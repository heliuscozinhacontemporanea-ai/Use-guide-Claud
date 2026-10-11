import { guideService } from '../factory';
import type { GuideItemRecord } from '../types/guideTypes';

/** Item do guia visível ao público: `null` se não existir ou estiver inativo. */
export async function getPublicGuideItemUseCase(id: string): Promise<GuideItemRecord | null> {
  const item = await guideService.getItemById(id);
  return item?.isActive === true ? item : null;
}
