import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../../../../ui/components/BackButton';
import { PartnerMoreTab } from './PartnerMoreTab';

/** Ganhos: recebimentos e, embaixo, Relatórios (p20). */
export function PartnerEarningsTab({
  earnings,
  reports,
  showReports,
  onShowReportsChange: setShowReports,
}: {
  earnings: ReactNode;
  reports: ReactNode;
  /** Relatórios abertos; a página do estabelecimento abre direto nas avaliações. */
  showReports: boolean;
  onShowReportsChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  if (showReports) {
    return (
      <div className="space-y-4">
        <BackButton label={t('partnerPanel.tabs.earnings')} onClick={() => setShowReports(false)} />
        {reports}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {earnings}
      <PartnerMoreTab
        title={t('partnerPanel.more.reports')}
        hideTitle
        groups={[
          [
            {
              id: 'reports',
              title: t('partnerPanel.more.reports'),
              hint: t('partnerPanel.more.reportsHint'),
              onOpen: () => setShowReports(true),
            },
          ],
        ]}
      />
    </div>
  );
}
