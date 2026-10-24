import { ErrorState } from '../../../../ui/components/ErrorState';
import { Skeleton } from '../../../../ui/components/Skeleton';
import type { GuideItem } from '../../types/guide';
import { SectionTitle } from '../SectionTitle';
import { StandardCard } from '../StandardCard';

export type ExploreCardVariant = 'square' | 'portrait' | 'landscape' | 'banner';

interface ExploreSectionProps {
  title: string;
  onSeeAll: () => void;
  items: GuideItem[];
  featuredIds: ReadonlySet<string>;
  variant: ExploreCardVariant;
  skeletonWrapClassName: string;
  skeletonClassName: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectItem: (item: GuideItem) => void;
  emptyMessage?: string;
}

/** Carrossel de uma categoria na home; as vagas "Destaque" vêm primeiro (D11). */
export function ExploreSection({
  title,
  onSeeAll,
  items,
  featuredIds,
  variant,
  skeletonWrapClassName,
  skeletonClassName,
  loading,
  error,
  onRetry,
  onSelectItem,
  emptyMessage,
}: ExploreSectionProps) {
  return (
    <>
      <SectionTitle title={title} onSeeAll={onSeeAll} />
      <div className="px-10 flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory">
        {error ? (
          <ErrorState message={error} onRetry={onRetry} />
        ) : loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className={skeletonWrapClassName}>
              <Skeleton className={skeletonClassName} />
            </div>
          ))
        ) : (
          items.map((item) => (
            <StandardCard
              key={item.id}
              item={item}
              variant={variant}
              onClick={() => onSelectItem(item)}
              featured={featuredIds.has(item.id)}
            />
          ))
        )}
        {emptyMessage && !loading && !error && items.length === 0 && (
          <div className="flex-1 text-center py-12 text-white/50 font-medium">{emptyMessage}</div>
        )}
      </div>
    </>
  );
}
