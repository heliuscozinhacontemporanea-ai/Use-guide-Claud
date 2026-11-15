import { guideService } from '../factory';
import type { GuideItemRecord } from '../types/guideTypes';

/** Itens que aparecem no guia: ativos e publicados (rascunho fica fora, D34). */
export async function listPublicGuideItemsUseCase(): Promise<GuideItemRecord[]> {
  const items = await guideService.getAllItems();
  return items.filter((item) => item.isActive === true && item.publication === 'published');
}
