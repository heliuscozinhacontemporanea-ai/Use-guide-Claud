import { useCallback, useState } from 'react';
import { createPageStack } from '../../../ui/hooks/pageStack';
import type { PartnerMorePageView } from '../components/panel/PartnerMoreSection';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';

export type CouponsScope = { kind: 'event' | 'offer'; id: string };

/** Página aberta por cima do painel; os cupons levam de onde foram abertos (evento ou oferta). */
export interface PanelPage {
  view: PartnerMorePageView;
  couponsScope?: CouponsScope | null;
}

/**
 * Aba do painel e o que está aberto dentro dela (página do evento, relatórios…). As páginas de Mais e
 * os cupons abrem por cima do painel, com entrada no histórico (D33, P19).
 */
export function usePanelNavigation() {
  const [panelTab, setPanelTab] = useState<PartnerPanelTab>('home');
  const [openReports, setOpenReports] = useState<false | 'sales' | 'reviews'>(false);
  const [openAccounts, setOpenAccounts] = useState(false);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  // Fora do estado do painel: abrir uma página não redesenha o painel inteiro.
  const [pages] = useState(() => createPageStack<PanelPage>('panel'));

  // Abrir uma aba fecha o que estava aberto dentro de outra.
  const openTab = useCallback((tab: PartnerPanelTab) => {
    setPanelTab(tab);
    setOpenReports(false);
    setOpenAccounts(false);
    setPlaceId(null);
    setEventId(null);
  }, []);

  const openMorePage = useCallback((view: PartnerMorePageView) => pages.push({ view }), [pages]);
  // Os cupons abrem por cima de onde a pessoa está (Início, evento ou oferta), sem trocar de aba.
  const openCoupons = useCallback(
    (from: CouponsScope | 'home') =>
      pages.push({ view: 'coupons', couponsScope: from === 'home' ? null : from }),
    [pages]
  );

  return {
    panelTab,
    setPanelTab,
    openReports,
    setOpenReports,
    openAccounts,
    setOpenAccounts,
    placeId,
    setPlaceId,
    eventId,
    setEventId,
    pages,
    openMorePage,
    openTab,
    openCoupons,
  };
}
