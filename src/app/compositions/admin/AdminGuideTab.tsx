import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminGuideCatalog } from '../../../domain/admin';
import type { GuideItem } from '../../../domain/guide';
import { isUseGuideOwner } from '../../../shared/constants/useGuideOwner';
import { cn } from '../../../shared/utils/cn';
import { ListCard, ListRowButton } from '../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../ui/components/ListState';
import { BUTTON_PARTNER_WIDE, BUTTON_SECONDARY } from '../../../ui/styles/controls';
import { setAdminGuideItems } from './adminGuideStore';
import { adminPages } from './adminStack';

type Filter = 'all' | 'useguide' | 'partners' | 'tips';
const FILTERS: Filter[] = ['all', 'useguide', 'partners', 'tips'];

function matches(item: GuideItem, filter: Filter): boolean {
  if (filter === 'tips') return item.category === 'tips';
  if (item.category === 'tips') return filter === 'all';
  if (filter === 'useguide') return isUseGuideOwner(item.ownerId);
  if (filter === 'partners') return !isUseGuideOwner(item.ownerId);
  return true;
}

/** Aba "Guia local" do admin (escolhas da F4): anúncios e dicas, abertos no editor do parceiro. */
export function AdminGuideTab() {
  const { t } = useTranslation();
  const { items, isLoading, error, retry } = useAdminGuideCatalog(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => setAdminGuideItems(items), [items]);

  const shown = useMemo(
    () =>
      items
        .filter((item) => item.category !== 'event' && matches(item, filter))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [items, filter]
  );

  const tag = (item: GuideItem) => {
    const key =
      item.category === 'tips'
        ? 'tip'
        : item.publication === 'draft'
          ? 'draft'
          : item.isActive === false
            ? 'paused'
            : isUseGuideOwner(item.ownerId)
              ? 'useguide'
              : 'partner';
    const warn = key === 'draft' || key === 'paused';
    return (
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
          warn
            ? 'bg-warn-soft text-warn'
            : key === 'useguide'
              ? 'bg-partner-soft text-partner'
              : 'bg-ink/[0.07] text-ink/70'
        )}
      >
        {t(`adminPanel.guide.tags.${key}`)}
      </span>
    );
  };

  const categoryLabel = (item: GuideItem) =>
    item.category === 'tips'
      ? t('adminPanel.guide.tags.tip')
      : t(`partnerSignup.categories.${item.category}`);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => adminPages.push({ view: 'tip' })}
          className={cn(BUTTON_SECONDARY, 'min-h-[52px] rounded-2xl')}
        >
          <Plus size={16} aria-hidden="true" className="inline mr-1" />
          {t('adminPanel.guide.newTip')}
        </button>
        <button
          type="button"
          onClick={() => adminPages.push({ view: 'listing-new' })}
          className={BUTTON_PARTNER_WIDE}
        >
          <Plus size={16} aria-hidden="true" />
          {t('adminPanel.guide.newListing')}
        </button>
      </div>
      <div
        role="group"
        aria-label={t('adminPanel.guide.filtersLabel')}
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
            className={cn(
              'press min-h-11 px-4 rounded-full border text-[14px] font-semibold focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none',
              filter === option
                ? 'bg-ink text-app border-ink'
                : 'bg-surface border-line text-ink/80'
            )}
          >
            {t(`adminPanel.guide.filters.${option}`)}
          </button>
        ))}
      </div>
      {error ? (
        <ListError message={t('adminPanel.guide.loadError')} onRetry={retry} />
      ) : isLoading ? (
        <ListLoading label={t('adminPanel.guide.loading')} />
      ) : shown.length === 0 ? (
        <ListEmpty message={t('adminPanel.guide.empty')} />
      ) : (
        <ListCard>
          {shown.map((item) => (
            <ListRowButton
              key={item.id}
              title={item.name}
              sub={[categoryLabel(item), item.location].filter(Boolean).join(' · ')}
              aside={tag(item)}
              onClick={() =>
                adminPages.push(
                  item.category === 'tips'
                    ? { view: 'tip', itemId: item.id }
                    : { view: 'listing-editor', itemId: item.id }
                )
              }
            />
          ))}
        </ListCard>
      )}
    </div>
  );
}
