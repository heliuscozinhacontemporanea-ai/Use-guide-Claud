import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import type { PartnerTodayItem } from '../../types/partnerHome';
import { PARTNER_HOME_CARD_SIZE, type PartnerHomeCardId } from '../../types/partnerHomeCards';
import type { PartnerCardData } from '../../utils/partnerHomeCardData';
import { cardSpan, PartnerHomeCard } from './PartnerHomeCard';
import type { PartnerPanelTab } from './partnerPanelTabs';

/** Onde o toque em cada cartão leva. */
const CARD_TAB: Record<PartnerHomeCardId, PartnerPanelTab> = {
  today: 'agenda',
  sales_today: 'earnings',
  next_payout: 'earnings',
  next_event: 'catalog',
  reviews: 'catalog',
  week_bookings: 'agenda',
  guests: 'catalog',
  promoters: 'catalog',
  plan_seal: 'more',
  week_occupancy: 'agenda',
  month_sales: 'earnings',
};

/** Cartões do Início em grade de duas colunas (p01) e o "Personalizar início" embaixo. */
export function PartnerHomeCards({
  cards,
  manyEstablishments,
  labelFor,
  onOpenTab,
  onCustomize,
}: {
  cards: PartnerCardData[];
  manyEstablishments: boolean;
  labelFor: (item: PartnerTodayItem) => string | null;
  onOpenTab: (tab: PartnerPanelTab) => void;
  onCustomize: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section aria-label={t('partnerPanel.cards.label')} className="space-y-7">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((data) => {
          const large = PARTNER_HOME_CARD_SIZE[data.id] === 'large';
          return (
            <div key={data.id} className={cn('flex', cardSpan(large))}>
              <PartnerHomeCard
                data={data}
                onOpen={() => onOpenTab(CARD_TAB[data.id])}
                labelFor={labelFor}
                manyEstablishments={manyEstablishments}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCustomize}
          className="press min-h-11 px-4 rounded-xl text-[14px] font-semibold text-accent focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('partnerPanel.cards.customize')}
        </button>
      </div>
    </section>
  );
}
