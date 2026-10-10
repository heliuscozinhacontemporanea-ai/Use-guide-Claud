import { SearchPort } from '../ports/searchPort';
import { GuideItem } from '../../guide';
import { filterItemsList } from '../hooks/useSearch';

export class LocalSearchAdapter implements SearchPort {
  filterItems(items: GuideItem[], searchQuery: string, appliedRegions: string[]): GuideItem[] {
    return filterItemsList(items, searchQuery, appliedRegions);
  }
}
