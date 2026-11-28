import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { SearchPill } from '../../../ui/components/SearchPill';
import { LiveConditions } from '../../climawind/components/LiveConditions';
import { useExploreSections } from '../hooks/useExploreSections';
import { useGuideCatalog } from '../hooks/useGuideCatalog';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import type { GuideItem } from '../types/guide';
import { ExploreSection } from './explore/ExploreSection';
import { EXPLORE_SECTIONS } from './explore/exploreSections';
import { PullRefreshIndicator } from './explore/PullRefreshIndicator';

interface ExploreViewProps {
  onSelectItem: (item: GuideItem) => void;
  onOpenSearch: () => void;
}

const SEARCH_PHRASES = [
  'destination',
  'tours',
  'events',
  'stays',
  'restaurants',
  'transfers',
  'rentals',
] as const;

export function ExploreView({ onSelectItem, onOpenSearch }: ExploreViewProps) {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  const { items, events, featured, loading, error, retry } = useGuideCatalog();
  const { pullDistance, isPulling, isRefreshing } = usePullToRefresh();

  const sectionFor = useExploreSections({ items, events, featured });
  const sections = useMemo(
    () => EXPLORE_SECTIONS.map((config) => ({ config, ...sectionFor(config.category) })),
    [sectionFor]
  );
  const phrases = useMemo(() => SEARCH_PHRASES.map((key) => t(`explore.search.${key}`)), [t]);

  const transformStyle =
    pullDistance > 0
      ? {
          transform: `translate3d(0, ${pullDistance}px, 0)`,
          transition: isPulling ? 'none' : 'transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }
      : undefined;

  return (
    <>
      <PullRefreshIndicator
        pullDistance={pullDistance}
        isPulling={isPulling}
        isRefreshing={isRefreshing}
      />

      <div className="space-y-4 pb-32 relative z-10" style={transformStyle}>
        <div className="px-4">
          <SearchPill label={t('explore.search.label')} phrases={phrases} onClick={onOpenSearch} />
        </div>

        {sections.map(({ config, items: sectionItems, featuredIds }) => (
          <ExploreSection
            key={config.category}
            title={config.title}
            onSeeAll={() => goTo(config.route)}
            items={sectionItems}
            featuredIds={featuredIds}
            variant={config.variant}
            skeletonWrapClassName={config.skeletonWrapClassName}
            skeletonClassName={config.skeletonClassName}
            loading={loading}
            error={error}
            onRetry={retry}
            onSelectItem={onSelectItem}
            emptyMessage={config.emptyMessage}
          />
        ))}

        <LiveConditions />
      </div>
    </>
  );
}
