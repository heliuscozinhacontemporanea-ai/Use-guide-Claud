import { useState, useCallback } from 'react';

export function useFilters(initialRegions: string[] = [], initialCategories: string[] = []) {
  const [appliedRegions, setAppliedRegions] = useState<string[]>(initialRegions);
  const [appliedCategories, setAppliedCategories] = useState<string[]>(initialCategories);

  const toggleRegion = useCallback((region: string) => {
    setAppliedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setAppliedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setAppliedRegions([]);
    setAppliedCategories([]);
  }, []);

  return {
    appliedRegions,
    setAppliedRegions,
    toggleRegion,
    appliedCategories,
    setAppliedCategories,
    toggleCategory,
    clearFilters,
  };
}
