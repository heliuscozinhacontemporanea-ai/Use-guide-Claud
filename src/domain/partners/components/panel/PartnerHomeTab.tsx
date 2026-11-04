import { useTranslation } from 'react-i18next';
import { ListError, ListLoading } from '../../../../ui/components/ListState';
import type { PartnerHomeCardId } from '../../types/partnerHomeCards';
import type {
  PartnerAttentionItem,
  PartnerHomeView,
  PartnerTodayItem,
} from '../../types/partnerHome';
import type { PartnerCardData } from '../../utils/partnerHomeCardData';
import { PartnerAttentionList } from './PartnerAttentionList';
import { PartnerCardsEditor } from './PartnerCardsEditor';
import { PartnerHomeCards } from './PartnerHomeCards';
import type { PartnerPanelTab } from './partnerPanelTabs';

export interface PartnerCardsState {
  /** Cartões do Início com dado no filtro atual. */
  visible: PartnerCardData[];
  /** Cartões com dado que podem ir para a galeria. */
  available: PartnerHomeCardId[];
  dataOf: (id: PartnerHomeCardId) => PartnerCardData | null;
  draft: PartnerHomeCardId[] | null;
  setDraft: (cards: PartnerHomeCardId[]) => void;
  startEditing: () => void;
  cancel: () => void;
  finish: () => void;
  saving: boolean;
  error: string | null;
}

/** Início: "Resolva agora" fixo no topo e os cartões escolhidos abaixo (D27, seção 6.1). */
export function PartnerHomeTab({
  loading,
  error,
  onRetry,
  view,
  attention,
  cards,
  labelFor,
  onOpenAttention,
  onOpenTab,
}: {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  view: PartnerHomeView | null;
  attention: PartnerAttentionItem[];
  cards: PartnerCardsState;
  labelFor: (item: PartnerTodayItem) => string | null;
  onOpenAttention: (item: PartnerAttentionItem) => void;
  onOpenTab: (tab: PartnerPanelTab) => void;
}) {
  const { t } = useTranslation();
  if (loading && !view) return <ListLoading label={t('partnerPanel.tabs.home')} />;
  if (error && !view) return <ListError message={t('partnerPanel.home.error')} onRetry={onRetry} />;
  if (!view) return null;
  if (cards.draft) {
    return (
      <PartnerCardsEditor
        draft={cards.draft}
        dataOf={cards.dataOf}
        onDraftChange={cards.setDraft}
        available={cards.available}
        onFinish={cards.finish}
        saving={cards.saving}
        error={cards.error}
        labelFor={labelFor}
        manyEstablishments={view.establishments.length > 1}
      />
    );
  }
  return (
    <div className="space-y-7">
      <PartnerAttentionList items={attention} onOpen={onOpenAttention} />
      <PartnerHomeCards
        cards={cards.visible}
        manyEstablishments={view.establishments.length > 1}
        labelFor={labelFor}
        onOpenTab={onOpenTab}
        onCustomize={cards.startEditing}
      />
    </div>
  );
}
