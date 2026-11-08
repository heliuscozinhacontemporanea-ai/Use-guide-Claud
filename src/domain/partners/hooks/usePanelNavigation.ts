import { useCallback, useState } from 'react';
import type { PartnerMoreView } from '../components/panel/PartnerMoreSection';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';

export type CouponsScope = { kind: 'event' | 'offer'; id: string };

/** Aba do painel e o que está aberto dentro dela (página do evento, relatórios, cupons…). */
export function usePanelNavigation() {
  const [panelTab, setPanelTab] = useState<PartnerPanelTab>('home');
  const [openReports, setOpenReports] = useState<false | 'sales' | 'reviews'>(false);
  const [openAccounts, setOpenAccounts] = useState(false);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [moreView, setMoreView] = useState<PartnerMoreView>('list');
  // Cupons abertos por um evento ou uma oferta: voltar leva de novo ao Catálogo.
  const [couponsFrom, setCouponsFrom] = useState<CouponsScope | 'home' | null>(null);

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

  const openCoupons = useCallback((from: CouponsScope | 'home') => {
    setCouponsFrom(from);
    setEventId(null);
    setMoreView('coupons');
    setPanelTab('more');
  }, []);

  /** Volta para onde os cupons foram abertos; `onOffer` reabre as ofertas no Catálogo. */
  const closeCoupons = useCallback(
    (onOffer?: () => void) => {
      if (couponsFrom && couponsFrom !== 'home' && couponsFrom.kind === 'offer') onOffer?.();
      if (couponsFrom === 'home') setPanelTab('home');
      else if (couponsFrom) setPanelTab('catalog');
      if (couponsFrom && couponsFrom !== 'home' && couponsFrom.kind === 'event') {
        setEventId(couponsFrom.id);
      }
      setCouponsFrom(null);
      setMoreView('list');
    },
    [couponsFrom]
  );

  const couponsScope = couponsFrom === 'home' ? null : couponsFrom;
  // Rótulo do "voltar" da área Cupons.
  const couponsBackKey =
    couponsFrom === 'home'
      ? 'partnerPanel.tabs.home'
      : couponsFrom
        ? 'partnerPanel.tabs.catalog'
        : 'partnerPanel.more.title';

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
    couponsScope,
    couponsBackKey,
    openTab,
    openCoupons,
    closeCoupons,
  };
}
