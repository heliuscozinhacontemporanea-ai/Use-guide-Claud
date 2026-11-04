import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatBusinessDate, formatBusinessDay } from '../../../../shared/utils/businessDateTime';
import { ListEmpty } from '../../../../ui/components/ListState';
import { StatusText } from '../../../../ui/components/StatusText';
import type { PartnerAttentionItem, PartnerAttentionKind } from '../../types/partnerHome';
import type { PartnerPanelTab } from './partnerPanelTabs';

/** Onde cada pendência se resolve. */
export const ATTENTION_TAB: Record<PartnerAttentionKind, PartnerPanelTab> = {
  provider_absence: 'agenda',
  sale_claim: 'earnings',
  debt: 'earnings',
  payment_account: 'earnings',
  verification_rejected: 'catalog',
  plan_expiring: 'catalog',
};

function useDetail() {
  const { t, i18n } = useTranslation();
  return (item: PartnerAttentionItem) => {
    const time = item.deadline
      ? formatBusinessDate(item.deadline, i18n.language, { hour: '2-digit', minute: '2-digit' })
      : '';
    const date = item.deadline ? formatBusinessDay(item.deadline, i18n.language) : '';
    return t(`partnerPanel.attention.${item.kind}.detail`, { time, date });
  };
}

/** "Resolva agora" (D27): sempre de todos os estabelecimentos, com prazo primeiro. */
export function PartnerAttentionList({
  items,
  onOpen,
}: {
  items: PartnerAttentionItem[];
  onOpen: (item: PartnerAttentionItem) => void;
}) {
  const { t } = useTranslation();
  const detail = useDetail();
  return (
    <section aria-labelledby="partner-attention-title">
      <h2
        id="partner-attention-title"
        className="px-1 mb-2 text-[18px] font-display font-bold text-ink"
      >
        {t('partnerPanel.home.attentionTitle')}
      </h2>
      {items.length === 0 ? (
        <ListEmpty message={t('partnerPanel.home.attentionEmpty')} />
      ) : (
        <ul className="rounded-[20px] bg-surface border border-line divide-y divide-line overflow-hidden">
          {items.map((item) => (
            <li key={`${item.kind}-${item.refId}`}>
              <button
                type="button"
                onClick={() => onOpen(item)}
                className="press w-full px-4 py-3.5 min-h-16 flex items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/50"
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-ink">
                    {t(`partnerPanel.attention.${item.kind}.title`)}
                  </span>
                  {item.title && (
                    <span className="block text-[13px] text-ink/70 truncate">{item.title}</span>
                  )}
                  <StatusText tone="warn" className="mt-1">
                    {detail(item)}
                  </StatusText>
                </span>
                <ChevronRight size={18} className="text-ink/50 shrink-0" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
