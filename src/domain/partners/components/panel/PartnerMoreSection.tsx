import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { type PartnerMoreEntry, PartnerMoreTab } from './PartnerMoreTab';

/** Telas da conta que vêm de outros domínios, montadas pela composição do app. */
export type PartnerAccountView = 'notifications' | 'terms' | 'help';
export type PartnerMoreView = 'list' | 'plans' | 'coupons' | PartnerAccountView;

/** Mais (p24): o que é da conta e não do dia a dia, em dois grupos. */
export function PartnerMoreSection({
  view,
  onViewChange,
  establishments,
  summary,
  withoutPlan,
  onOpenProducer,
  onOpenEstablishments,
  onOpenPlan,
  onOpenEarnings,
  renderAccountView,
  notificationsHint,
  onReplayTour,
  renderCoupons,
  showProducer = true,
  sells = true,
  onAddSegment,
  couponsSegment = null,
}: {
  /** Segmento que dá nome aos cupons ("Cupons dos seus passeios"); `null` = genérico. */
  couponsSegment?: 'tours' | 'rentals' | 'transfers' | 'attraction' | 'events' | null;
  view: PartnerMoreView;
  onViewChange: (view: PartnerMoreView) => void;
  establishments: Array<{ id: string; name: string }>;
  summary: { documents: number; pendingVerifications: number } | null;
  withoutPlan: number;
  onOpenProducer: () => void;
  onOpenEstablishments: () => void;
  onOpenPlan: (listing: { id: string; name: string }) => void;
  onOpenEarnings: () => void;
  renderAccountView?: (view: PartnerAccountView, onBack: () => void) => ReactNode;
  /** Escolha de avisos de venda (notifications), montada pela composição. */
  notificationsHint?: ReactNode;
  /** "Ver o tour do painel" em Ajuda (etapa 6). */
  onReplayTour?: () => void;
  /** Área Cupons, montada pela composição (promotions). */
  renderCoupons?: () => ReactNode;
  /** Só com o segmento Eventos (painel por segmento). */
  showProducer?: boolean;
  /** Vende pelo app: contas de recebimento e cupons; a vitrine (hospedagem, restaurante) não. */
  sells?: boolean;
  /** "Também trabalha com…?" (S3): abre a folha de segmentos. */
  onAddSegment?: () => void;
}) {
  const { t } = useTranslation();
  const back = () => onViewChange('list');
  if (view === 'plans') {
    return (
      <div className="space-y-4">
        <BackButton label={t('partnerPanel.more.title')} onClick={back} />
        <PartnerMoreTab
          title={t('partnerPanel.more.plans')}
          groups={[
            establishments.map((item) => ({
              id: item.id,
              title: item.name,
              onOpen: () => onOpenPlan(item),
            })),
          ]}
        />
      </div>
    );
  }
  if (view === 'coupons') return <>{renderCoupons?.()}</>;
  if (view !== 'list') return <>{renderAccountView?.(view, back)}</>;

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
      onOpen: () => onViewChange('plans'),
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
    renderCoupons && sells
      ? [
          {
            id: 'coupons',
            title: couponsSegment
              ? t(`partnerPanel.more.couponsBy.${couponsSegment}`)
              : t('partnerPanel.more.coupons'),
            hint: couponsSegment ? undefined : t('partnerPanel.more.couponsHint'),
            onOpen: () => onViewChange('coupons'),
          },
        ]
      : [];
  const addSegment: PartnerMoreEntry[] = onAddSegment
    ? [
        {
          id: 'add-segment',
          title: t('partnerAddSegment.entry'),
          icon: <Plus size={18} aria-hidden="true" />,
          partner: true,
          onOpen: onAddSegment,
        },
      ]
    : [];
  const help: PartnerMoreEntry[] = renderAccountView
    ? [
        {
          id: 'notifications',
          title: t('partnerPanel.more.notifications'),
          hint: notificationsHint,
          onOpen: () => onViewChange('notifications'),
        },
        { id: 'terms', title: t('partnerPanel.more.terms'), onOpen: () => onViewChange('terms') },
        { id: 'help', title: t('partnerPanel.more.help'), onOpen: () => onViewChange('help') },
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
