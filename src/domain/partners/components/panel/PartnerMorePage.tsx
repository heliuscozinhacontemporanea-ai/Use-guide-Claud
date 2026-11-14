import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PartnerMoreTab } from './PartnerMoreTab';
import type { PartnerAccountView, PartnerMorePageView } from './PartnerMoreSection';

type CouponsSegment = 'tours' | 'rentals' | 'transfers' | 'attraction' | 'events' | null;

/** Título da página na barra fixa (D33). */
export function partnerMorePageTitle(
  view: PartnerMorePageView,
  t: TFunction,
  couponsSegment: CouponsSegment
): string {
  if (view === 'plans') return t('partnerPanel.more.plans');
  if (view === 'coupons') {
    return couponsSegment
      ? t(`partnerPanel.more.couponsBy.${couponsSegment}`)
      : t('partnerPanel.more.coupons');
  }
  if (view === 'gate-staff') return t('gateStaff.owner.title');
  return t(`partnerPanel.more.${view}`);
}

/**
 * Página aberta a partir de Mais (planos, cupons, portaria, avisos, termos e ajuda), por cima do
 * painel, com o `<` e o título na barra fixa (D33). As telas de outros domínios vêm da composição.
 */
export function PartnerMorePage({
  view,
  establishments,
  onOpenPlan,
  renderAccountView,
  renderCoupons,
  renderGateStaff,
}: {
  view: PartnerMorePageView;
  establishments: Array<{ id: string; name: string }>;
  onOpenPlan: (listing: { id: string; name: string }) => void;
  renderAccountView?: (view: PartnerAccountView) => ReactNode;
  renderCoupons?: () => ReactNode;
  renderGateStaff?: () => ReactNode;
}) {
  const { t } = useTranslation();
  if (view === 'plans') {
    return (
      <PartnerMoreTab
        title={t('partnerPanel.more.plans')}
        hideTitle
        groups={[
          establishments.map((item) => ({
            id: item.id,
            title: item.name,
            onOpen: () => onOpenPlan(item),
          })),
        ]}
      />
    );
  }
  if (view === 'coupons') return <>{renderCoupons?.()}</>;
  if (view === 'gate-staff') return <>{renderGateStaff?.()}</>;
  return <>{renderAccountView?.(view)}</>;
}
