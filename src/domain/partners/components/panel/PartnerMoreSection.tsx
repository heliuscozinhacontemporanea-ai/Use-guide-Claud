import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { PartnerMoreTab } from './PartnerMoreTab';

export type PartnerMoreView = 'list' | 'reports' | 'plans';

/** Mais: lista da conta, relatórios e o plano de cada estabelecimento. */
export function PartnerMoreSection({
  view,
  onViewChange,
  establishments,
  reports,
  onOpenPlan,
  onOpenEarnings,
  onBackToGuide,
}: {
  view: PartnerMoreView;
  onViewChange: (view: PartnerMoreView) => void;
  establishments: Array<{ id: string; name: string }>;
  reports: ReactNode;
  onOpenPlan: (listing: { id: string; name: string }) => void;
  onOpenEarnings: () => void;
  onBackToGuide: () => void;
}) {
  const { t } = useTranslation();
  if (view !== 'list') {
    return (
      <div className="space-y-4">
        <BackButton label={t('partnerPanel.more.title')} onClick={() => onViewChange('list')} />
        {view === 'reports' ? (
          reports
        ) : (
          <PartnerMoreTab
            title={t('partnerPanel.more.plans')}
            entries={establishments.map((item) => ({
              id: item.id,
              title: item.name,
              hint: t('partnerPanel.more.plansHint'),
              onOpen: () => onOpenPlan(item),
            }))}
          />
        )}
      </div>
    );
  }
  return (
    <PartnerMoreTab
      title={t('partnerPanel.more.title')}
      entries={[
        {
          id: 'reports',
          title: t('partnerPanel.more.reports'),
          hint: t('partnerPanel.more.reportsHint'),
          onOpen: () => onViewChange('reports'),
        },
        {
          id: 'plans',
          title: t('partnerPanel.more.plans'),
          hint: t('partnerPanel.more.plansHint'),
          onOpen: () => onViewChange('plans'),
        },
        {
          id: 'accounts',
          title: t('partnerPanel.more.accounts'),
          hint: t('partnerPanel.more.accountsHint'),
          onOpen: onOpenEarnings,
        },
        {
          id: 'back',
          title: t('partnerPanel.backToGuide'),
          hint: t('partnerPanel.more.backHint'),
          onOpen: onBackToGuide,
        },
      ]}
    />
  );
}
