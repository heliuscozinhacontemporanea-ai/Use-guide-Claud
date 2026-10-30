import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoneyMinor } from '../../../../shared/utils/money';
import { StatusText } from '../../../../ui/components/StatusText';
import { listAdminSaleClaimsUseCase } from '../../application/usecases/listAdminSaleClaimsUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminSaleClaim } from '../../types/adminFinance';
import { AdminQueueFrame } from './AdminQueueFrame';
import { QueueRow } from './QueueRow';
import { SaleClaimDecisionDialog } from './SaleClaimDecisionDialog';
import { formatBusinessDay } from '../../../../shared/utils/businessDateTime';

export function SaleClaimQueue({
  onNotice,
  renderEvidence,
}: {
  onNotice: (message: string, error?: boolean) => void;
  renderEvidence?: (claim: AdminSaleClaim) => ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const queue = useAdminFinanceQueue(listAdminSaleClaimsUseCase);
  const [deciding, setDeciding] = useState<AdminSaleClaim | null>(null);
  return (
    <>
      <AdminQueueFrame
        hint={t('adminFinance.claims.hint')}
        loading={queue.loading}
        error={queue.error}
        empty={queue.data.length === 0}
        emptyMessage={t('adminFinance.claims.empty')}
        hasMore={queue.hasMore}
        onRetry={() => void queue.reload()}
        onLoadMore={() => void queue.loadMore()}
      >
        {queue.data.map((claim) => {
          const pending = claim.status === 'refund_pending';
          return (
            <QueueRow
              key={claim.id}
              title={claim.title ?? t(`adminFinance.claims.fallbackTitle.${claim.referenceType}`)}
              subtitle={`${claim.sellerName ?? t('adminFinance.unknownSeller')} · ${t(
                `saleClaims.reason.${claim.reason}`
              )}`}
              status={
                pending ? (
                  <StatusText tone="info">{t('adminFinance.claims.refundPending')}</StatusText>
                ) : (
                  <StatusText tone="warn">
                    {t('adminFinance.claims.decideBy', {
                      date: formatBusinessDay(claim.decideBy, i18n.language),
                    })}
                  </StatusText>
                )
              }
              amount={formatMoneyMinor(claim.refundableMinor, i18n.language)}
              onOpen={pending ? undefined : () => setDeciding(claim)}
            />
          );
        })}
      </AdminQueueFrame>
      <SaleClaimDecisionDialog
        key={deciding?.id ?? 'none'}
        claim={deciding}
        renderEvidence={renderEvidence}
        onClose={() => setDeciding(null)}
        onDecided={(message) => {
          setDeciding(null);
          onNotice(message);
          void queue.reload();
        }}
      />
    </>
  );
}
