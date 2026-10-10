import { useState, useMemo, useCallback } from 'react';
import { GuideItem } from '../../guide';

export function filterItemsList(
  items: GuideItem[],
  searchQuery: string,
  appliedRegions: string[]
): GuideItem[] {
  const filtered = items.filter((item) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const nameMatch = item.name?.toLowerCase().includes(q) || false;
      const descMatch = item.description?.toLowerCase().includes(q) || false;
      const addressMatch = item.address?.toLowerCase().includes(q) || false;
      const tagMatch = item.tags?.some((t: string) => t.toLowerCase().includes(q)) || false;
      if (!nameMatch && !descMatch && !addressMatch && !tagMatch) return false;
    }

    if (appliedRegions.length > 0) {
      let isLocMatch = false;
      for (const region of appliedRegions) {
        if (item.location === region) {
          isLocMatch = true;
          break;
        }

        const normLoc = item.location
          ?.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const normRegion = region
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (normLoc === normRegion) {
          isLocMatch = true;
          break;
        }

        if (region === 'Jericoacoara' && item.location === 'jeri') {
          isLocMatch = true;
          break;
        } else if (region === 'Praia do Preá' && item.location === 'prea') {
          isLocMatch = true;
          break;
        } else if (region === 'Barrinha de Baixo' && item.location === 'barrinha') {
          isLocMatch = true;
          break;
        } else if (
          region === 'Guriú' &&
          (item.location === 'jeri' ||
            item.name?.toLowerCase().includes('guriu') ||
            item.description?.toLowerCase().includes('guriu') ||
            item.address?.toLowerCase().includes('guriu'))
        ) {
          isLocMatch = true;
          break;
        } else if (
          region === 'Cavalo Bravo' &&
          (item.name?.toLowerCase().includes('cavalo bravo') ||
            item.description?.toLowerCase().includes('cavalo bravo') ||
            item.address?.toLowerCase().includes('cavalo bravo'))
        ) {
          isLocMatch = true;
          break;
        } else if (
          region === 'Caiçara' &&
          (item.name?.toLowerCase().includes('caiçara') ||
            item.name?.toLowerCase().includes('caicara') ||
            item.description?.toLowerCase().includes('caiçara') ||
            item.description?.toLowerCase().includes('caicara') ||
            item.address?.toLowerCase().includes('caiçara') ||
            item.address?.toLowerCase().includes('caicara'))
        ) {
          isLocMatch = true;
          break;
        } else if (
          region === 'Jijoca de Jericoacoara' &&
          (item.name?.toLowerCase().includes('jijoca') ||
            item.description?.toLowerCase().includes('jijoca') ||
            item.address?.toLowerCase().includes('jijoca'))
        ) {
          isLocMatch = true;
          break;
        } else if (
          region === 'Lagamar' &&
          (item.name?.toLowerCase().includes('lagamar') ||
            item.description?.toLowerCase().includes('lagamar') ||
            item.address?.toLowerCase().includes('lagamar'))
        ) {
          isLocMatch = true;
          break;
        }
      }
      if (!isLocMatch) return false;
    }

    return true;
  });

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    return [...filtered].sort((a, b) => {
      const aNameScore = a.name?.toLowerCase().includes(q) ? 2 : 1;
      const bNameScore = b.name?.toLowerCase().includes(q) ? 2 : 1;
      return bNameScore - aNameScore;
    });
  }

  return filtered;
}

export function useSearch(items: GuideItem[], initialQuery = '', initialRegions: string[] = []) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [appliedRegions, setAppliedRegions] = useState<string[]>(initialRegions);

  const filteredItems = useMemo(() => {
    return filterItemsList(items, searchQuery, appliedRegions);
  }, [items, searchQuery, appliedRegions]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    appliedRegions,
    setAppliedRegions,
    filteredItems,
    clearSearch,
  };
}
