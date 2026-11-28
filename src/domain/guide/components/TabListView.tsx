import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TAB_FILTERS } from '../../../shared/constants/navigation';
import { useLocalizedRouting } from '../../../shared/hooks/useLocalizedRouting';
import type { RouteKey } from '../../../shared/i18n';
import { FilterPills } from '../../../ui/components/FilterPills';
import { GridItemSkeleton } from '../../../ui/components/Skeleton';
import { useGuideCatalog } from '../hooks/useGuideCatalog';
import type { GuideItem } from '../types/guide';
import { orderTabListing } from '../utils/tabListing';
import { StandardCard } from './StandardCard';

interface TabListViewProps {
  tab: keyof typeof TAB_FILTERS;
  routeKey: RouteKey;
  onSelectItem: (item: GuideItem) => void;
}

/**
 * Abas Experiências e Serviços (D37 item 8): as pílulas filtram a lista e cada uma tem a URL da
 * categoria, que continua indexável. Trocar de pílula substitui a entrada do histórico.
 */
export function TabListView({ tab, routeKey, onSelectItem }: TabListViewProps) {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  const { items, events, featured, loading } = useGuideCatalog();
  const filters = TAB_FILTERS[tab];

  const { items: list, featuredIds } = useMemo(
    () => orderTabListing(routeKey, items, events, featured),
    [routeKey, items, events, featured]
  );

  return (
    <div className="pb-32 relative z-10 space-y-3">
      <FilterPills
        label={t(`navigation.${tab}`)}
        value={routeKey}
        onChange={(next) => goTo(next, '', { replace: true })}
        options={filters.map((filter) => ({
          value: filter.routeKey,
          label: t(filter.translationKey),
        }))}
      />
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading
          ? [1, 2, 3, 4].map((i) => <GridItemSkeleton key={i} />)
          : list.map((item) => (
              <StandardCard
                key={item.id}
                item={item}
                variant="horizontal"
                className="min-w-0 w-full"
                onClick={() => onSelectItem(item)}
                featured={featuredIds.has(item.id)}
              />
            ))}
        {!loading && list.length === 0 && (
          <p className="text-center py-20 text-body text-ink-muted">{t('explore.tabs.empty')}</p>
        )}
      </div>
    </div>
  );
}
