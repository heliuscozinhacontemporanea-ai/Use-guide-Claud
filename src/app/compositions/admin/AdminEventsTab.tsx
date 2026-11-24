import { Plus } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminGuideCatalog } from '../../../domain/admin';
import { newPartnerEventDraft } from '../../../domain/partners';
import { isUseGuideOwner, USE_GUIDE_OWNER_ID } from '../../../shared/constants/useGuideOwner';
import { cn } from '../../../shared/utils/cn';
import { ListCard, ListRowButton } from '../../../ui/components/ListRows';
import { ListEmpty, ListError, ListLoading } from '../../../ui/components/ListState';
import { BUTTON_PARTNER_WIDE } from '../../../ui/styles/controls';
import { toEventDraft } from './adminEventRecord';
import { setAdminEvent } from './adminEventStore';
import { setAdminGuideItems } from './adminGuideStore';
import { adminPages } from './adminStack';

/** Aba "Agenda" do admin (escolhas da F4): eventos do Use Guide e de parceiros no editor do parceiro. */
export function AdminEventsTab() {
  const { t } = useTranslation();
  const { items, events, isLoading, error, retry } = useAdminGuideCatalog(true);

  // O editor do evento escolhe o estabelecimento entre os anúncios do Use Guide.
  useEffect(() => setAdminGuideItems(items), [items]);

  const sorted = useMemo(
    () => [...events].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')),
    [events]
  );

  const open = (draft: ReturnType<typeof newPartnerEventDraft>) => {
    setAdminEvent({ draft });
    adminPages.push({ view: 'event' });
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => open(newPartnerEventDraft(USE_GUIDE_OWNER_ID))}
        className={BUTTON_PARTNER_WIDE}
      >
        <Plus size={16} aria-hidden="true" />
        {t('adminPanel.events.new')}
      </button>
      {error ? (
        <ListError message={t('adminPanel.events.loadError')} onRetry={retry} />
      ) : isLoading ? (
        <ListLoading label={t('adminPanel.events.loading')} />
      ) : sorted.length === 0 ? (
        <ListEmpty message={t('adminPanel.events.empty')} />
      ) : (
        <ListCard>
          {sorted.map((event) => {
            const useGuide = isUseGuideOwner(event.ownerId);
            return (
              <ListRowButton
                key={event.id}
                title={event.name}
                sub={[event.eventCategory, event.location].filter(Boolean).join(' · ')}
                aside={
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      useGuide ? 'bg-partner-soft text-partner' : 'bg-ink/[0.07] text-ink/70'
                    )}
                  >
                    {t(
                      useGuide ? 'adminPanel.guide.tags.useguide' : 'adminPanel.guide.tags.partner'
                    )}
                  </span>
                }
                onClick={() => open(toEventDraft(event))}
              />
            );
          })}
        </ListCard>
      )}
    </div>
  );
}
