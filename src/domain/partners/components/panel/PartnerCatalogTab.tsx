import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatBusinessDay,
  formatBusinessWeekday,
} from '../../../../shared/utils/businessDateTime';
import { capitalizeFirst } from '../../../../shared/utils/formatters';
import { locationName } from '../../../../shared/utils/locationName';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import type { StatusTone } from '../../../../ui/components/StatusText';
import { TextButton } from '../../../../ui/components/TextButton';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerCatalogEvent } from '../../types/partnerHome';

export type CatalogSegment = 'places' | 'events' | 'offers';

const EVENT_TONE: Record<PartnerCatalogEvent['status'], StatusTone> = {
  published: 'success',
  draft: 'warn',
  paused: 'warn',
  ended: 'muted',
};

/** Catálogo (p09): lugares, eventos e passeios, cada linha com o status. */
export function PartnerCatalogTab({
  segment,
  parts = ['places', 'events', 'offers'],
  offersLabel = 'tours',
  title,
  onSegmentChange,
  places,
  placesLoading,
  events,
  groups,
  onOpenPlace,
  onOpenEvent,
  onCreate,
  offers,
}: {
  segment: CatalogSegment;
  /** Partes que os segmentos do parceiro usam; com uma só, o seletor some. */
  parts?: CatalogSegment[];
  /** Chave em `partnerPanel.catalog.offersBy`. */
  offersLabel?: string;
  title?: string;
  onSegmentChange: (segment: CatalogSegment) => void;
  places: PartnerContentRecord[];
  placesLoading: boolean;
  events: {
    data: PartnerCatalogEvent[];
    loading: boolean;
    error: string | null;
    reload: () => void;
  };
  /** Com "Todos" e mais de um estabelecimento, os eventos vêm agrupados (11.3). */
  groups: Array<{ id: string; name: string }> | null;
  onOpenPlace: (item: PartnerContentRecord) => void;
  onOpenEvent: (eventId: string) => void;
  onCreate: () => void;
  offers: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const placeRow = (item: PartnerContentRecord) => {
    const paused = item.isActive === false;
    const status = paused
      ? t('partnerCatalog.status.paused')
      : [
          t('partnerCatalog.status.published'),
          item.isVerified && t('partnerCatalog.status.verified'),
        ]
          .filter(Boolean)
          .join(' · ');
    return (
      <ListRowButton
        key={item.id}
        title={item.name}
        sub={[
          t(`partnerPanel.category.${item.category}`, { defaultValue: '' }),
          locationName(item.location),
        ]
          .filter(Boolean)
          .join(' · ')}
        status={{ tone: paused ? 'warn' : 'success', text: status }}
        onClick={() => onOpenPlace(item)}
      />
    );
  };

  const eventRow = (event: PartnerCatalogEvent) => {
    const sub =
      event.status === 'ended' && event.lastStartsAt
        ? t('partnerCatalog.endedOn', { date: formatBusinessDay(event.lastStartsAt, locale) })
        : event.sessions > 1 && event.nextStartsAt
          ? `${t('partnerCatalog.sessions', { count: event.sessions })} · ${t(
              'partnerCatalog.next',
              {
                date: formatBusinessWeekday(event.nextStartsAt, locale),
              }
            )}`
          : event.nextStartsAt
            ? capitalizeFirst(formatBusinessWeekday(event.nextStartsAt, locale), locale)
            : undefined;
    const extra =
      event.status === 'draft' && event.missing
        ? t(`partnerCatalog.missing.${event.missing}`)
        : event.status === 'published' && event.sold > 0
          ? t('partnerCatalog.sold', { count: event.sold })
          : null;
    return (
      <ListRowButton
        key={event.id}
        title={event.title}
        sub={sub}
        status={{
          tone: EVENT_TONE[event.status],
          text: [t(`partnerCatalog.status.${event.status}`), extra].filter(Boolean).join(' · '),
        }}
        onClick={() => onOpenEvent(event.id)}
      />
    );
  };

  const eventsContent = () => {
    if (events.loading) return <ListLoading label={t('partnerPanel.catalog.events')} />;
    if (events.error)
      return <ListError message={t('partnerCatalog.loadError')} onRetry={events.reload} />;
    if (events.data.length === 0) return <ListEmpty message={t('partnerCatalog.emptyEvents')} />;
    if (!groups) return <ListCard>{events.data.map(eventRow)}</ListCard>;
    const sections = [
      ...groups.map((group) => ({
        ...group,
        rows: events.data.filter((event) => event.establishmentIds.includes(group.id)),
      })),
      {
        id: 'none',
        name: '',
        rows: events.data.filter((event) => event.establishmentIds.length === 0),
      },
    ].filter((section) => section.rows.length > 0);
    return sections.map((section) => (
      <div key={section.id} className="space-y-2">
        {section.name && (
          <h3 className="px-1 text-[13px] font-semibold text-ink/70">{section.name}</h3>
        )}
        <ListCard>{section.rows.map(eventRow)}</ListCard>
      </div>
    ));
  };

  return (
    <section aria-labelledby="partner-catalog-title" className="space-y-5">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 id="partner-catalog-title" className="text-[22px] font-display font-bold text-ink">
          {title ?? t('partnerPanel.catalog.title')}
        </h2>
        <TextButton tone="accent" onClick={onCreate} data-tour="catalog-create">
          <Plus size={18} aria-hidden="true" />
          {t('partnerCatalog.create')}
        </TextButton>
      </div>
      {parts.length > 1 && (
        <div data-tour="catalog-kinds">
          <SegmentedControl<CatalogSegment>
            label={t('partnerPanel.catalog.title')}
            value={segment}
            onChange={onSegmentChange}
            options={parts.map((part) => ({
              value: part,
              label:
                part === 'offers'
                  ? t(`partnerPanel.catalog.offersBy.${offersLabel}`)
                  : t(`partnerPanel.catalog.${part}`),
            }))}
          />
        </div>
      )}
      <div data-tour="catalog-list">
        {segment === 'places' ? (
          placesLoading ? (
            <ListLoading label={t('partnerPanel.catalog.places')} />
          ) : places.length === 0 ? (
            <ListEmpty message={t('partnerCatalog.emptyPlaces')} />
          ) : (
            <ListCard>{places.map(placeRow)}</ListCard>
          )
        ) : segment === 'events' ? (
          <div className="space-y-4">{eventsContent()}</div>
        ) : (
          offers
        )}
      </div>
    </section>
  );
}
