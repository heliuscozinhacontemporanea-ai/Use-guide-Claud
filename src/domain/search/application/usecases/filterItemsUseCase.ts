import { z } from 'zod';
import { searchAdapter } from '../../factory';
import { GuideItem } from '../../../guide';

const filterItemsSchema = z.object({
  items: z.array(z.any()),
  searchQuery: z.string(),
  appliedRegions: z.array(z.string()),
});

export function filterItemsUseCase(
  items: GuideItem[],
  searchQuery: string,
  appliedRegions: string[]
): GuideItem[] {
  filterItemsSchema.parse({ items, searchQuery, appliedRegions });
  return searchAdapter.filterItems(items, searchQuery, appliedRegions);
}
