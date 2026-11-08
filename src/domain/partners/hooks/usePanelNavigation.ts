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
  const [couponsFrom, setCouponsFrom] = useState<CouponsScope | null>(null);

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

  const openCoupons = useCallback((from: CouponsScope) => {
    setCouponsFrom(from);
    setEventId(null);
    setMoreView('coupons');
    setPanelTab('more');
  }, []);

  /** Devolve de onde os cupons foram abertos, para o painel voltar ao lugar certo. */
  const closeCoupons = useCallback(() => {
    if (couponsFrom) setPanelTab('catalog');
    if (couponsFrom?.kind === 'event') setEventId(couponsFrom.id);
    setCouponsFrom(null);
    setMoreView('list');
    return couponsFrom;
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
