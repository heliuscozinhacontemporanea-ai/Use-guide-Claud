import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import type { PartnerContentRecord } from '../../types/partnerContent';
import { PartnerEventsTable } from '../subcomponents/PartnerEventsTable';
import { PartnerItemsTable } from '../subcomponents/PartnerItemsTable';

export type CatalogSegment = 'places' | 'events' | 'offers';

/** Catálogo (antes "Anúncios", D27): lugares, eventos e passeios do parceiro. */
export function PartnerCatalogTab({
  segment,
  onSegmentChange,
  items,
  events,
  loading,
  onEditItem,
  onCreateItem,
  onEditEvent,
  onCreateEvent,
  onToggleActive,
  verificationVersion,
  onVerifyItem,
  planVersion,
  onOpenPlan,
  offers,
}: {
  segment: CatalogSegment;
  onSegmentChange: (segment: CatalogSegment) => void;
  items: PartnerContentRecord[];
  events: PartnerContentRecord[];
  loading: boolean;
  onEditItem: (item: PartnerContentRecord) => void;
  onCreateItem: () => void;
  onEditEvent: (item: PartnerContentRecord) => void;
  onCreateEvent: () => void;
  onToggleActive: React.ComponentProps<typeof PartnerItemsTable>['onToggleActive'];
  verificationVersion: number;
  onVerifyItem: (item: PartnerContentRecord) => void;
  planVersion: number;
  onOpenPlan: (item: PartnerContentRecord) => void;
  offers: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="partner-catalog-title" className="space-y-5">
      <h2 id="partner-catalog-title" className="px-1 text-[22px] font-display font-bold text-ink">
        {t('partnerPanel.catalog.title')}
      </h2>
      <SegmentedControl<CatalogSegment>
        label={t('partnerPanel.catalog.title')}
        value={segment}
        onChange={onSegmentChange}
        options={[
          { value: 'places', label: t('partnerPanel.catalog.places') },
          { value: 'events', label: t('partnerPanel.catalog.events') },
          { value: 'offers', label: t('partnerPanel.catalog.offers') },
        ]}
      />
      {segment === 'places' ? (
        <PartnerItemsTable
          itemsList={items}
          loading={loading}
          onEditItem={onEditItem}
          onToggleActive={onToggleActive}
          onCreateNew={onCreateItem}
          verificationVersion={verificationVersion}
          onVerifyItem={onVerifyItem}
          planVersion={planVersion}
          onOpenPlan={onOpenPlan}
        />
      ) : segment === 'events' ? (
        <PartnerEventsTable
          eventsList={events}
          loading={loading}
          onEditEvent={onEditEvent}
          onToggleActive={onToggleActive}
          onCreateNew={onCreateEvent}
        />
      ) : (
        offers
      )}
    </section>
  );
}
