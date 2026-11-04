import { useTranslation } from 'react-i18next';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import type { ReactNode } from 'react';

export type CatalogSegment = 'places' | 'events' | 'offers';

/** Catálogo (antes "Anúncios", D27): lugares, eventos e passeios do parceiro. */
export function PartnerCatalogTab({
  segment,
  onSegmentChange,
  places,
  events,
  offers,
}: {
  segment: CatalogSegment;
  onSegmentChange: (segment: CatalogSegment) => void;
  places: ReactNode;
  events: ReactNode;
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
      {segment === 'places' ? places : segment === 'events' ? events : offers}
    </section>
  );
}
