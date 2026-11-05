import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { type PartnerMoreEntry, PartnerMoreTab } from './PartnerMoreTab';

/** Telas da conta que vêm de outros domínios, montadas pela composição do app. */
export type PartnerAccountView = 'notifications' | 'terms' | 'help';
export type PartnerMoreView = 'list' | 'plans' | PartnerAccountView;

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
}: {
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
    {
      id: 'producer',
      title: t('partnerPanel.more.producer'),
      hint: t('partnerPanel.more.producerHint'),
      onOpen: onOpenProducer,
    },
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
    {
      id: 'accounts',
      title: t('partnerPanel.more.accounts'),
      hint: t('partnerPanel.more.accountsHint'),
      onOpen: onOpenEarnings,
    },
  ];
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
      ]
    : [];
  return <PartnerMoreTab title={t('partnerPanel.more.title')} groups={[account, help]} />;
}
