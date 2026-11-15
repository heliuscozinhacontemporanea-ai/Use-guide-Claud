import { useCallback, useState } from 'react';
import { createPageStack } from '../../../ui/hooks/pageStack';
import type { PartnerMorePageView } from '../components/panel/PartnerMoreSection';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';
import type { ListingStepId } from '../types/partnerHome';

export type CouponsScope = { kind: 'event' | 'offer'; id: string };

/**
 * Página aberta por cima do painel (D33). Estabelecimento, evento e conta levam o título da linha
 * tocada: a barra fixa mostra o nome antes de a página terminar de carregar.
 */
export type PanelPage =
  | { view: PartnerMorePageView; couponsScope?: CouponsScope | null }
  | { view: 'place'; id: string; title: string }
  | { view: 'event'; id: string; title: string }
  | { view: 'reports' }
  | { view: 'reports-profile' }
  | { view: 'accounts' }
  | { view: 'account'; key: string; title: string }
  /** Um passo do guia do anúncio (D34): os campos do passo ou o publicar. */
  | { view: 'listing-step'; itemId: string; step: ListingStepId | 'publish'; title: string };

/**
 * Aba do painel e as páginas abertas por cima dela (estabelecimento, evento, relatórios, contas, Mais),
 * com entrada no histórico (D33, P19). Uma página abre por cima de onde a pessoa está, sem trocar de aba.
 */
export function usePanelNavigation() {
  const [panelTab, setPanelTab] = useState<PartnerPanelTab>('home');
  // Fora do estado do painel: abrir uma página não redesenha o painel inteiro.
  const [pages] = useState(() => createPageStack<PanelPage>('panel'));

  // Ir para outra aba fecha as páginas abertas por cima da atual.
  const openTab = useCallback(
    (tab: PartnerPanelTab) => {
      pages.clear();
      setPanelTab(tab);
    },
    [pages]
  );

  const openMorePage = useCallback((view: PartnerMorePageView) => pages.push({ view }), [pages]);
  // Os cupons abrem por cima de onde a pessoa está (Início, evento ou oferta).
  const openCoupons = useCallback(
    (from: CouponsScope | 'home') =>
      pages.push({ view: 'coupons', couponsScope: from === 'home' ? null : from }),
    [pages]
  );
  const openPlace = useCallback(
    (place: { id: string; name: string }) =>
      pages.push({ view: 'place', id: place.id, title: place.name }),
    [pages]
  );
  const openEvent = useCallback(
    (event: { id: string; title: string }) =>
      pages.push({ view: 'event', id: event.id, title: event.title }),
    [pages]
  );
  const openReports = useCallback(() => pages.push({ view: 'reports' }), [pages]);
  const openReportsProfile = useCallback(() => pages.push({ view: 'reports-profile' }), [pages]);
  const openAccounts = useCallback(() => pages.push({ view: 'accounts' }), [pages]);
  const openAccount = useCallback(
    (account: { key: string; title: string }) =>
      pages.push({ view: 'account', key: account.key, title: account.title }),
    [pages]
  );

  const openListingStep = useCallback(
    (itemId: string, step: ListingStepId | 'publish', title: string) =>
      pages.push({ view: 'listing-step', itemId, step, title }),
    [pages]
  );

  return {
    panelTab,
    setPanelTab,
    pages,
    openTab,
    openMorePage,
    openCoupons,
    openPlace,
    openEvent,
    openReports,
    openReportsProfile,
    openListingStep,
    openAccounts,
    openAccount,
  };
}
