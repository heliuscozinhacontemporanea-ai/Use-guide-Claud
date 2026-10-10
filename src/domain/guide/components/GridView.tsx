import { useMemo } from 'react';
import { StandardCard } from './StandardCard';
import { GridItemSkeleton, Skeleton } from '../../../ui/components/Skeleton';
import { GuideItem } from '../types/guide';
import { useGuideCatalog } from '../hooks/useGuideCatalog';
import { cn } from '../../../shared/utils/cn';

interface GridViewProps {
  category: GuideItem['category'];
  onSelectItem: (item: GuideItem) => void;
}

export function GridView({ category, onSelectItem }: GridViewProps) {
  const { events: dbEvents, items: dbItems, loading } = useGuideCatalog();

  const items = useMemo(() => {
    const rawItems =
      category === 'event'
        ? dbEvents
        : dbItems.filter((item: GuideItem) => item.category === category);
    return [...rawItems].sort((a, b) => {
      const isAVerified = !!(a.isVerified && !a.isVerificationSuspended);
      const isBVerified = !!(b.isVerified && !b.isVerificationSuspended);
      if (isAVerified === isBVerified) return 0;
      return isAVerified ? -1 : 1;
    });
  }, [category, dbEvents, dbItems]);

  return (
    <div className="px-6 pb-32 relative z-10 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {loading
          ? [1, 2, 3, 4, 5, 6].map((i) =>
              category === 'sight' ? (
                <Skeleton key={i} className="aspect-square w-full rounded-full" />
              ) : (
                <GridItemSkeleton key={i} />
              )
            )
          : items.map((item) => (
              <StandardCard
                key={item.id}
                item={item}
                variant={category === 'sight' ? 'square' : 'horizontal'}
                className="min-w-0 w-full"
                onClick={() => onSelectItem(item)}
              />
            ))}
        {!loading && items.length === 0 && (
          <div className="text-center py-20 text-white/50 font-medium">
            Nenhum item encontrado nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
}
