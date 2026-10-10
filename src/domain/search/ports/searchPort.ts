import { GuideItem } from '../../guide';

export interface SearchPort {
  filterItems(items: GuideItem[], searchQuery: string, appliedRegions: string[]): GuideItem[];
}
