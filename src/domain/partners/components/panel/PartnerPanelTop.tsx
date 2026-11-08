import type { usePartnerPanelHome } from '../../hooks/usePartnerPanelHome';
import { PartnerHomeHeader } from './PartnerHomeHeader';
import { PartnerShortcuts } from './PartnerShortcuts';
import type { PartnerPanelTab } from './partnerPanelTabs';

/** Cabeçalho do Início e os atalhos; somem no modo Personalizar (p03). */
export function PartnerPanelTop({
  home,
  tab,
  onTabChange,
  onBack,
}: {
  home: ReturnType<typeof usePartnerPanelHome>;
  tab: PartnerPanelTab;
  onTabChange: (tab: PartnerPanelTab) => void;
  onBack: () => void;
}) {
  if (home.cards.editing) return null;
  return (
    <>
      {tab === 'home' && (
        <PartnerHomeHeader
          establishments={home.establishments}
          filterName={home.filterName}
          otherPending={home.otherPending}
          onOpenFilter={() => home.setSheetOpen(true)}
          onBack={onBack}
        />
      )}
      <PartnerShortcuts value={tab} onChange={onTabChange} />
    </>
  );
}
