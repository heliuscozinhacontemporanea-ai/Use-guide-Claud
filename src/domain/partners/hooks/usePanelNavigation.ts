import { useCallback, useState } from 'react';
import type { PartnerMoreView } from '../components/panel/PartnerMoreSection';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';

/** Aba do painel e o que está aberto dentro dela (página do evento, relatórios, cupons…). */
export function usePanelNavigation() {
  const [panelTab, setPanelTab] = useState<PartnerPanelTab>('home');
  const [openReports, setOpenReports] = useState<false | 'sales' | 'reviews'>(false);
  const [openAccounts, setOpenAccounts] = useState(false);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [moreView, setMoreView] = useState<PartnerMoreView>('list');
  // Cupons abertos pela página de um evento: voltar leva de novo a ela.
  const [couponsFrom, setCouponsFrom] = useState<string | null>(null);

  // Abrir uma aba fecha o que estava aberto dentro de outra.
  const openTab = useCallback((tab: PartnerPanelTab) => {
    setPanelTab(tab);
    setOpenReports(false);
    setOpenAccounts(false);
    setPlaceId(null);
    setEventId(null);
    setMoreView('list');
    setCouponsFrom(null);
  }, []);

  const openCoupons = useCallback((fromEventId: string) => {
    setCouponsFrom(fromEventId);
    setEventId(null);
    setMoreView('coupons');
    setPanelTab('more');
  }, []);

  const closeCoupons = useCallback(() => {
    if (couponsFrom) {
      setPanelTab('catalog');
      setEventId(couponsFrom);
    }
    setCouponsFrom(null);
    setMoreView('list');
  }, [couponsFrom]);

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
    moreView,
    setMoreView,
    couponsFrom,
    openTab,
    openCoupons,
    closeCoupons,
  };
}
