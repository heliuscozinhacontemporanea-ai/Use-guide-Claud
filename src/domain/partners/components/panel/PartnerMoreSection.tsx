import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type PartnerMoreEntry, PartnerMoreTab } from './PartnerMoreTab';

/** Telas da conta que vêm de outros domínios, montadas pela composição do app. */
export type PartnerAccountView = 'notifications' | 'terms' | 'help';
/** Páginas abertas a partir de Mais, por cima do painel (D33). */
export type PartnerMorePageView = 'plans' | 'coupons' | 'gate-staff' | PartnerAccountView;

/**
 * Mais (p24): o que é da conta e não do dia a dia, em dois grupos. Cada linha abre uma página por
 * cima do painel (`PartnerMorePage`), com a barra fixa e o voltar arrastando.
 */
export function PartnerMoreSection({
  onOpenPage,
  summary,
  withoutPlan,
  onOpenProducer,
  onOpenEstablishments,
  onOpenEarnings,
  hasAccountViews,
  notificationsHint,
  onReplayTour,
  hasCoupons,
  hasGateStaff,
  showGateStaff = true,
  showProducer = true,
  sells = true,
  onAddSegment,
  couponsSegment = null,
}: {
  /** Segmento que dá nome aos cupons ("Cupons dos seus passeios"); `null` = genérico. */
  couponsSegment?: 'tours' | 'rentals' | 'transfers' | 'attraction' | 'events' | null;
  onOpenPage: (view: PartnerMorePageView) => void;
  summary: { documents: number; pendingVerifications: number } | null;
  withoutPlan: number;
  onOpenProducer: () => void;
  onOpenEstablishments: () => void;
  onOpenEarnings: () => void;
  /** Avisos, termos e ajuda vêm da composição do app. */
  hasAccountViews: boolean;
  /** Escolha de avisos de venda (notifications), montada pela composição. */
  notificationsHint?: ReactNode;
  /** "Ver o tour do painel" em Ajuda (etapa 6). */
  onReplayTour?: () => void;
  /** Área Cupons, montada pela composição (promotions). */
  hasCoupons: boolean;
  /** Equipe da portaria (C1), montada pela composição (ticketing). */
  hasGateStaff: boolean;
  /** Só com portaria: segmentos Eventos ou Atração. */
  showGateStaff?: boolean;
  /** Só com o segmento Eventos (painel por segmento). */
  showProducer?: boolean;
  /** Vende pelo app: contas de recebimento e cupons; a vitrine (hospedagem, restaurante) não. */
  sells?: boolean;
  /** "Também trabalha com…?" (S3): abre a folha de segmentos. */
  onAddSegment?: () => void;
}) {
  const { t } = useTranslation();
  const documentsHint = summary
    ? [
        t('partnerPanel.more.documents', { count: summary.documents }),
        summary.pendingVerifications > 0
          ? t('partnerPanel.more.pendingVerifications', { count: summary.pendingVerifications })
          : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : undefined;
  const account: PartnerMoreEntry[] = [
    ...(showProducer
      ? [
          {
            id: 'producer',
            title: t('partnerPanel.more.producer'),
            hint: t('partnerPanel.more.producerHint'),
            onOpen: onOpenProducer,
          },
        ]
      : []),
    {
      id: 'establishments',
      title: t('partnerPanel.more.establishments'),
      hint: documentsHint,
      onOpen: onOpenEstablishments,
    },
    {
      id: 'plans',
      title: t('partnerPanel.more.plans'),
      hint:
        withoutPlan > 0
          ? t('partnerPanel.more.withoutPlan', { count: withoutPlan })
          : t('partnerPanel.more.plansHint'),
      onOpen: () => onOpenPage('plans'),
    },
    ...(sells
      ? [
          {
            id: 'accounts',
            title: t('partnerPanel.more.accounts'),
            hint: t('partnerPanel.more.accountsHint'),
            onOpen: onOpenEarnings,
          },
        ]
      : []),
  ];
  const sales: PartnerMoreEntry[] =
    hasCoupons && sells
      ? [
          {
            id: 'coupons',
            title: couponsSegment
              ? t(`partnerPanel.more.couponsBy.${couponsSegment}`)
              : t('partnerPanel.more.coupons'),
            hint: couponsSegment ? undefined : t('partnerPanel.more.couponsHint'),
            onOpen: () => onOpenPage('coupons'),
          },
        ]
      : [];
  if (hasGateStaff && showGateStaff) {
    sales.push({
      id: 'gate-staff',
      title: t('gateStaff.owner.title'),
      hint: t('gateStaff.owner.entryHint'),
      onOpen: () => onOpenPage('gate-staff'),
    });
  }
  const addSegment: PartnerMoreEntry[] = onAddSegment
    ? [
        {
          id: 'add-segment',
          title: t('partnerAddSegment.entry'),
          icon: <Plus size={20} aria-hidden="true" />,
          partner: true,
          onOpen: onAddSegment,
        },
      ]
    : [];
  const help: PartnerMoreEntry[] = hasAccountViews
    ? [
        {
          id: 'notifications',
          title: t('partnerPanel.more.notifications'),
          hint: notificationsHint,
          onOpen: () => onOpenPage('notifications'),
        },
        { id: 'terms', title: t('partnerPanel.more.terms'), onOpen: () => onOpenPage('terms') },
        { id: 'help', title: t('partnerPanel.more.help'), onOpen: () => onOpenPage('help') },
        ...(onReplayTour
          ? [
              {
                id: 'tour',
                title: t('partnerTour.replay'),
                hint: t('partnerTour.replayHint'),
                onOpen: onReplayTour,
              },
            ]
          : []),
      ]
    : [];
  return (
    <PartnerMoreTab
      title={t('partnerPanel.more.title')}
      groups={[[...account, ...sales], addSegment, help]}
      groupTitles={[
        t('partnerPanel.more.groupBusiness'),
        undefined,
        t('partnerPanel.more.groupHelp'),
      ]}
      tourTarget="more-list"
    />
  );
}
