import { useEffect } from 'react';
import { useGuideCatalogStore } from '../stores/useGuideCatalogStore';

export function useGuideCatalog() {
  const items = useGuideCatalogStore((state) => state.items);
  const events = useGuideCatalogStore((state) => state.events);
  const featured = useGuideCatalogStore((state) => state.featured);
  const loading = useGuideCatalogStore((state) => state.loading);
  const error = useGuideCatalogStore((state) => state.error);
  const retry = useGuideCatalogStore((state) => state.retry);

  useEffect(() => {
    const release = useGuideCatalogStore.getState().acquire();
    return release;
  }, []);

  return {
    items,
    events,
    featured,
    loading,
    error,
    retry,
  };
}
