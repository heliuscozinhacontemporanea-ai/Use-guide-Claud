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
  /**
   * Um bloco do anúncio (D34): pelo guia do Início (com "Passo X de N") ou pelo editor (F2), que tem
   * também o WhatsApp do negócio.
   */
  | {
      view: 'listing-step';
      itemId: string;
      step: ListingStepId | 'phone' | 'publish';
      title: string;
      from?: 'guide' | 'editor';
    }
  /** Editar anúncio (F2): a lista de blocos do estabelecimento. */
  | { view: 'listing-editor'; itemId: string; title: string }
  /** Novo estabelecimento pelo Catálogo (F2): "Seu negócio" sem os Termos, já aceitos. */
  | { view: 'listing-new'; categories?: string[] }
  /** Editor de evento como página (item 4 da D33): a lista de seções ou uma seção. */
  | { view: 'event-editor'; title: string }
  | { view: 'event-section'; section: string; title: string };

/** Páginas do editor de evento: a lista de seções e cada seção. */
export const isEventEditorPage = (page: PanelPage) =>
  page.view === 'event-editor' || page.view === 'event-section';

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
    (
      itemId: string,
      step: ListingStepId | 'phone' | 'publish',
      title: string,
      from: 'guide' | 'editor' = 'guide'
    ) => pages.push({ view: 'listing-step', itemId, step, title, from }),
    [pages]
  );
  const openListingEditor = useCallback(
    (place: { id: string; name: string }) =>
      pages.push({ view: 'listing-editor', itemId: place.id, title: place.name }),
    [pages]
  );
  const openNewListing = useCallback(
    (categories?: string[]) => pages.push({ view: 'listing-new', categories }),
    [pages]
  );
  const openEventEditor = useCallback(
    (title: string) => pages.push({ view: 'event-editor', title }),
    [pages]
  );
  const openEventSection = useCallback(
    (section: string, title: string) => pages.push({ view: 'event-section', section, title }),
    [pages]
  );
  // Salvar ou excluir fecha de uma vez as páginas de cima que pertencem ao que acabou (ex.: o editor
  // do evento e as seções dele; o anúncio excluído e a página do estabelecimento).
  const closeTop = useCallback(
    (match: (page: PanelPage) => boolean) => {
      const open = pages.getPages();
      let count = 0;
      while (count < open.length && match(open[open.length - 1 - count] as PanelPage)) count++;
      if (count > 0) pages.back(count);
    },
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
    openListingEditor,
    openNewListing,
    openEventEditor,
    openEventSection,
    closeTop,
    openAccounts,
    openAccount,
  };
}
