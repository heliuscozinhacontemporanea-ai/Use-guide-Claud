import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import type { PanelPage } from '../../hooks/usePanelNavigation';
import type { PartnerContentRecord } from '../../types/partnerContent';
import type { PartnerEstablishment, PartnerTodayItem } from '../../types/partnerHome';
import type { PartnerPanelProps } from '../partnerPanelProps';
import { PartnerCatalogPage } from './PartnerCatalogPage';
import type { PartnerCatalogRenders } from './PartnerCatalogSection';
import type { PartnerEarningsRenders } from './PartnerEarningsTab';
import { PartnerMorePage, partnerMorePageTitle } from './PartnerMorePage';
import { PartnerReportsPage } from './PartnerReportsPage';

type CouponsSegment = Parameters<typeof partnerMorePageTitle>[2];

/** O que as páginas da pilha do painel precisam do painel (dados, versões e ações). */
export interface PartnerPanelPageContext {
  items: PartnerContentRecord[];
  events: PartnerContentRecord[];
  establishments: PartnerEstablishment[];
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
      return page.title;
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
