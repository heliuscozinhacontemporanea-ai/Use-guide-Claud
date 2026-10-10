import { GuideItem } from '../../guide';

export interface CategoryFilter {
  id: string;
  label: string;
}

export interface FilterBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  appliedRegions: string[];
  onAppliedRegionsChange: (regions: string[]) => void;
  appliedCategories: string[];
  onAppliedCategoriesChange: (categories: string[]) => void;
  placeholder?: string;
  onStickyChange?: (isSticky: boolean) => void;
}

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: GuideItem) => void;
}

export interface SearchFilterState {
  searchQuery: string;
  appliedRegions: string[];
  appliedCategories: string[];
}
