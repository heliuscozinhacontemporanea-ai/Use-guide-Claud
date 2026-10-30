import { getItemByIdUseCase } from '../../guide';
import type { BookableItem, BookableItemLookupPort } from '../ports/bookableItemLookupPort';

export class GuideBookableItemLookupAdapter implements BookableItemLookupPort {
  async getItem(guideItemId: string): Promise<BookableItem | null> {
    const item = await getItemByIdUseCase(guideItemId);
    if (!item?.ownerId) return null;
    return {
      id: item.id,
      ownerId: item.ownerId,
      partnerId:
        typeof item.partnerId === 'string' && item.partnerId ? item.partnerId : item.ownerId,
      category: String(item.category ?? ''),
      name: typeof item.name === 'string' ? item.name : '',
    };
  }
}
