import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import type { StackAction } from '../../../../ui/layouts/stack/stackTypes';
import type { PanelPage } from '../../hooks/usePanelNavigation';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerTodayItem } from '../../types/partnerHome';
import type { EventEditorSection } from '../PartnerEventEditor';
import type { PartnerPanelProps } from '../partnerPanelProps';
import { PartnerCatalogPage } from './PartnerCatalogPage';
import type { OfferPageRenderProps, PartnerCatalogRenders } from './PartnerCatalogSection';
import type { PartnerEarningsRenders } from './PartnerEarningsTab';
import {
  ListingBlockPage,
  ListingEditorPanelPage,
  type ListingPagesContext,
  NewListingPanelPage,
} from './PartnerListingPages';
import { PartnerMorePage, partnerMorePageTitle } from './PartnerMorePage';
import { PartnerReportsPage } from './PartnerReportsPage';

type CouponsSegment = Parameters<typeof partnerMorePageTitle>[2];

/** O que as páginas da pilha do painel precisam do painel (dados, versões e ações). */
export interface PartnerPanelPageContext extends ListingPagesContext {
  events: PartnerContentRecord[];
  eventReloadKey: number;
  eventsVersion: number;
  verificationVersion: number;
  planVersion: number;
  catalogRenders: PartnerCatalogRenders;
  earningsRenders: PartnerEarningsRenders;
  /** Visitas e avaliações (insights), montado pela composição. */
  reportsProfile: ReactNode;
  onOpenSession: (item: PartnerTodayItem) => void;
  onEditItem: (item: PartnerContentRecord) => void;
  onEditEvent: (item: PartnerContentRecord, hasSales: boolean) => void;
  onOpenPlan: (listing: { id: string; name: string }) => void;
  onVerify: (item: PartnerContentRecord) => void;
  onToggleActive: (itemId: string, active: boolean) => Promise<void>;
  onOpenReportsProfile: () => void;
  onOpenAccount: (account: { key: string; title: string }) => void;
  onOpenCoupons?: (target: { kind: 'event' | 'offer'; id: string }) => void;
  onOpenEarnings?: () => void;
  renderAccountView?: PartnerPanelProps['renderAccountView'];
  renderCoupons?: PartnerPanelProps['renderCoupons'];
  renderGateStaff?: PartnerPanelProps['renderGateStaff'];
  /** Editor do evento aberto: a lista de seções (`null`) ou uma seção (item 4 da D33). */
  renderEventEditor: (section: EventEditorSection | null) => ReactNode;
  /** Páginas de oferta (F3): a do editor entrega o salvar à barra. */
  registerOfferSave: (save: (() => void) | null) => void;
  onOfferSaved: (saved: { offerId: string; title: string; created: boolean }) => void;
  onOpenOfferPage: OfferPageRenderProps['onOpenPage'];
  onOfferFormDone: OfferPageRenderProps['onFormDone'];
  offerFormVersion: number;
}

/** Título da página na barra fixa (D33). */
export function partnerPanelPageTitle(
  page: PanelPage,
  t: TFunction,
  couponsSegment: CouponsSegment
): string {
  switch (page.view) {
    case 'place':
    case 'event':
    case 'account':
    case 'listing-step':
    case 'event-editor':
    case 'event-section':
      return page.title;
    case 'offer':
      return page.request.title;
    case 'listing-editor':
      return t('partnerGuide.editor.title');
    case 'listing-new':
      return page.categories?.length === 1 && page.categories[0] === 'producer'
        ? t('partnerPanel.more.producer')
        : t('partnerGuide.editor.newTitle');
    case 'reports':
      return t('partnerEarnings.reports.title');
    case 'reports-profile':
      return t('partnerEarnings.reports.profile');
    case 'accounts':
      return t('paymentAccounts.page.title');
    default:
      return partnerMorePageTitle(page.view, t, couponsSegment);
  }
}

/**
 * Conteúdo de cada página aberta por cima do painel (D33): estabelecimento e evento (Catálogo),
 * relatórios e contas (Ganhos) e as páginas de Mais.
 */
export function PartnerPanelPageContent({
  page,
  context,
}: {
  page: PanelPage;
  context: PartnerPanelPageContext;
}) {
  switch (page.view) {
    case 'place':
    case 'event':
      return (
        <PartnerCatalogPage
          page={page}
          items={context.items}
          events={context.events}
          establishments={context.establishments}
          eventReloadKey={context.eventReloadKey}
          eventsVersion={context.eventsVersion}
          verificationVersion={context.verificationVersion}
          planVersion={context.planVersion}
          renders={context.catalogRenders}
          onOpenSession={context.onOpenSession}
          onEditItem={context.onEditItem}
          onEditEvent={context.onEditEvent}
          onOpenPlan={(item) => context.onOpenPlan({ id: item.id, name: item.name })}
          onVerify={context.onVerify}
          onToggleActive={context.onToggleActive}
          onOpenReviews={context.onOpenReportsProfile}
          onOpenCoupons={context.onOpenCoupons}
          onOpenEarnings={context.onOpenEarnings}
        />
      );
    case 'reports':
      return <PartnerReportsPage onOpenProfile={context.onOpenReportsProfile} />;
    case 'reports-profile':
      return <>{context.reportsProfile}</>;
    case 'accounts':
      return (
        <>{context.earningsRenders.renderAccounts?.({ onOpenAccount: context.onOpenAccount })}</>
      );
    case 'account':
      return <>{context.earningsRenders.renderAccount?.(page.key)}</>;
    case 'listing-step':
      return <ListingBlockPage page={page} context={context} />;
    case 'listing-editor':
      return <ListingEditorPanelPage page={page} context={context} />;
    case 'listing-new':
      return <NewListingPanelPage page={page} context={context} />;
    case 'event-editor':
      return <>{context.renderEventEditor(null)}</>;
    case 'event-section':
      return <>{context.renderEventEditor(page.section as EventEditorSection)}</>;
    case 'offer':
      return (
        <>
          {context.catalogRenders.renderOfferPage?.({
            page: page.request,
            registerSave: context.registerOfferSave,
            onSaved: context.onOfferSaved,
            onOpenPage: context.onOpenOfferPage,
            onFormDone: context.onOfferFormDone,
            version: context.offerFormVersion,
          })}
        </>
      );
    default: {
      const { renderCoupons } = context;
      const scope = page.view === 'coupons' ? (page.couponsScope ?? null) : null;
      return (
        <PartnerMorePage
          view={page.view}
          establishments={context.items}
          onOpenPlan={context.onOpenPlan}
          renderAccountView={context.renderAccountView}
          renderCoupons={renderCoupons ? () => renderCoupons({ scope }) : undefined}
          renderGateStaff={context.renderGateStaff}
        />
      );
    }
  }
}

/**
 * Ação da barra fixa: "Salvar" nos blocos do anúncio (grava e volta), no editor de oferta e nas páginas
 * do editor de evento (grava o evento inteiro e fecha o editor).
 */
export function partnerPanelPageAction(
  page: PanelPage,
  t: TFunction,
  actions: {
    saveListing: () => void;
    saveOffer: () => void;
    saveEvent: () => void;
    savingEvent: boolean;
  }
): StackAction | undefined {
  if (page.view === 'listing-step' && page.step !== 'publish') {
    return { label: t('partnerGuide.page.save'), onClick: actions.saveListing };
  }
  if (page.view === 'offer' && page.request.kind === 'editor') {
    // Oferta nova: "Criar" na barra, como no protótipo da F3 (tela 8).
    const label = page.request.offerId ? 'partnerGuide.page.save' : 'partnerGuide.page.create';
    return { label: t(label), onClick: actions.saveOffer };
  }
  if (page.view === 'offer' && page.request.kind === 'openSlots') {
    return { label: t('partnerGuide.page.create'), onClick: actions.saveOffer };
  }
  if (page.view === 'offer' && page.request.kind === 'openDays') {
    return { label: t('partnerGuide.page.open'), onClick: actions.saveOffer };
  }
  if (page.view === 'event-editor' || page.view === 'event-section') {
    return {
      label: actions.savingEvent ? t('partnerGuide.page.saving') : t('partnerCatalog.editor.save'),
      onClick: actions.saveEvent,
    };
  }
  return undefined;
}
