import { useTranslation } from 'react-i18next';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import type {
  PartnerAttentionItem,
  PartnerHomeView,
  PartnerTodayItem,
} from '../../types/partnerHome';
import { PartnerAttentionList } from './PartnerAttentionList';
import { PartnerHomeNumbers } from './PartnerHomeNumbers';
import { PartnerTodayList } from './PartnerTodayList';

export function PartnerHomeTab({
  loading,
  error,
  onRetry,
  view,
  attention,
  today,
  labelFor,
  onOpenAttention,
  onOpenToday,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  view: PartnerHomeView | null;
  attention: PartnerAttentionItem[];
  today: PartnerTodayItem[];
  labelFor: (item: PartnerTodayItem) => string | null;
  onOpenAttention: (item: PartnerAttentionItem) => void;
  onOpenToday: (item: PartnerTodayItem) => void;
}) {
  const { t } = useTranslation();
  if (loading && !view) return <ListLoading label={t('partnerPanel.tabs.home')} />;
  if (error && !view) return <ListError message={t('partnerPanel.home.error')} onRetry={onRetry} />;
  if (!view) return null;
  return (
    <div className="space-y-7">
      <PartnerAttentionList items={attention} onOpen={onOpenAttention} />
      <PartnerTodayList
        title={t('partnerPanel.home.todayTitle')}
        items={today}
        labelFor={labelFor}
        onOpen={onOpenToday}
      />
      <PartnerHomeNumbers
        numbers={view.numbers}
        manyEstablishments={view.establishments.length > 1}
      />
    </div>
  );
}
