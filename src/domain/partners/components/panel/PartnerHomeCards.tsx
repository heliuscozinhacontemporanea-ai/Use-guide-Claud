import { useTranslation } from 'react-i18next';
import { PARTNER_HOME_CARD_SIZE, type PartnerHomeCardId } from '../../types/partnerHomeCards';
import type { PartnerCardData } from '../../utils/partnerHomeCardData';
import { PartnerHomeCard } from './PartnerHomeCard';
import type { PartnerPanelTab } from './partnerPanelTabs';

/** Onde o toque em cada cartão leva. */
const CARD_TAB: Record<PartnerHomeCardId, PartnerPanelTab> = {
  today: 'agenda',
  sales_today: 'earnings',
  next_payout: 'earnings',
  next_event: 'catalog',
  reviews: 'catalog',
  week_bookings: 'agenda',
  plan_seal: 'more',
  week_occupancy: 'agenda',
  month_sales: 'earnings',
};

// Somam a conta inteira: o filtro de estabelecimento não se aplica a eles.
const ACCOUNT_WIDE = new Set<PartnerHomeCardId>(['sales_today', 'next_payout', 'month_sales']);

export function PartnerHomeCards({
  cards,
  manyEstablishments,
  onOpenTab,
  onCustomize,
}: {
  cards: PartnerCardData[];
  manyEstablishments: boolean;
  onOpenTab: (tab: PartnerPanelTab) => void;
  onCustomize: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section aria-label={t('partnerPanel.cards.label')} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((data) => (
          <PartnerHomeCard
            key={data.id}
            data={data}
            large={PARTNER_HOME_CARD_SIZE[data.id] === 'large'}
            onOpen={() => onOpenTab(CARD_TAB[data.id])}
            scopeNote={
              manyEstablishments && ACCOUNT_WIDE.has(data.id)
                ? t('partnerPanel.home.allEstablishments')
                : undefined
            }
          />
        ))}
      </div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCustomize}
          className="press min-h-11 px-4 rounded-xl text-[15px] font-semibold text-accent focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('partnerPanel.cards.customize')}
        </button>
      </div>
    </section>
  );
}
