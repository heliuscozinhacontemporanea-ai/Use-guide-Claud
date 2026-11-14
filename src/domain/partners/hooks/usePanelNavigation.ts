import { useCallback, useEffect, useState } from 'react';
import { useHistoryPages } from '../../../ui/hooks/useHistoryPages';
import type { PartnerMorePageView } from '../components/panel/PartnerMoreSection';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';

export type CouponsScope = { kind: 'event' | 'offer'; id: string };

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
  const pages = useHistoryPages<PartnerMorePageView>('panel');
  // Cupons abertos por um evento ou uma oferta mostram só os dele.
  const [couponsScope, setCouponsScope] = useState<CouponsScope | null>(null);
  useEffect(() => {
    if (!pages.pages.includes('coupons')) setCouponsScope(null);
  }, [pages.pages]);

  // Abrir uma aba fecha o que estava aberto dentro de outra.
  const openTab = useCallback((tab: PartnerPanelTab) => {
    setPanelTab(tab);
    setOpenReports(false);
    setOpenAccounts(false);
    setPlaceId(null);
    setEventId(null);
  }, []);

  const { push } = pages;
  // Os cupons abrem por cima de onde a pessoa está (Início, evento ou oferta), sem trocar de aba.
  const openCoupons = useCallback(
    (from: CouponsScope | 'home') => {
      setCouponsScope(from === 'home' ? null : from);
      push('coupons');
    },
    [push]
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
    morePages: pages.pages,
    openMorePage: pages.push,
    closePage: pages.back,
    couponsScope,
    openTab,
    openCoupons,
  };
}
