import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import { LiveConditions } from '../../climawind/components/LiveConditions';
import { FilterBar } from '../../search';
import { useExploreSections } from '../hooks/useExploreSections';
import { useGuideCatalog } from '../hooks/useGuideCatalog';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import type { GuideItem } from '../types/guide';
import { ExploreSection } from './explore/ExploreSection';
import { EXPLORE_SECTIONS } from './explore/exploreSections';
import { PullRefreshIndicator } from './explore/PullRefreshIndicator';

interface ExploreViewProps {
  onSelectItem: (item: GuideItem) => void;
  onStickyChange?: (isSticky: boolean) => void;
}

export function ExploreView({ onSelectItem, onStickyChange }: ExploreViewProps) {
  const { goTo } = useLocalizedRouting();
  const { items, events, featured, loading, error, retry } = useGuideCatalog();
  const { pullDistance, isPulling, isRefreshing } = usePullToRefresh();

  const [searchQuery, setSearchQuery] = useState('');
  const [appliedRegions, setAppliedRegions] = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);

  const sectionFor = useExploreSections({
    items,
    events,
    featured,
    searchQuery,
    appliedRegions,
    appliedCategories,
  });
  const sections = useMemo(
    () => EXPLORE_SECTIONS.map((config) => ({ config, ...sectionFor(config.category) })),
    [sectionFor]
  );

  const transformStyle =
    pullDistance > 0
      ? {
          transform: `translate3d(0, ${pullDistance}px, 0)`,
          transition: isPulling ? 'none' : 'transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        }
      : undefined;

  const hasActiveFiltersOrSearch =
    searchQuery.trim().length > 0 || appliedRegions.length > 0 || appliedCategories.length > 0;
  const hasAnyResults = sections.some((section) => section.items.length > 0);

  return (
    <>
      <PullRefreshIndicator
        pullDistance={pullDistance}
        isPulling={isPulling}
        isRefreshing={isRefreshing}
      />

      <div className="space-y-4 pb-32 relative z-10" style={transformStyle}>
        <div className="px-10 mb-1 mt-0">
          <h2 className="text-2xl font-display font-bold tracking-tight text-white">Explorar</h2>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          appliedRegions={appliedRegions}
          onAppliedRegionsChange={setAppliedRegions}
          appliedCategories={appliedCategories}
          onAppliedCategoriesChange={setAppliedCategories}
          placeholder="Buscar eventos, pousadas, restaurantes..."
          onStickyChange={onStickyChange}
        />

        {sections.map(({ config, items: sectionItems, featuredIds }) =>
          (appliedCategories.length === 0 || appliedCategories.includes(config.category)) &&
          (!hasActiveFiltersOrSearch || sectionItems.length > 0) ? (
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
          ) : null
        )}

        {hasActiveFiltersOrSearch && !hasAnyResults && !loading && !error && (
          <div className="mx-10 py-12 px-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center text-center shadow-lg animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <Search size={20} className="text-white/50" />
            </div>
            <h3 className="text-base font-display font-bold text-white/90">
              Nenhum resultado encontrado
            </h3>
            <p className="text-xs text-white/45 mt-2 max-w-xs leading-relaxed">
              {searchQuery.trim()
                ? `Não encontramos itens correspondentes a "${searchQuery}" com os filtros aplicados.`
                : 'Não encontramos itens correspondentes aos filtros selecionados neste momento.'}
            </p>
          </div>
        )}

        <LiveConditions />
      </div>
    </>
  );
}
