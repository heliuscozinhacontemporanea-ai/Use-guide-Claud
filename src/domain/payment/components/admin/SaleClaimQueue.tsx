import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listAdminSaleClaimsUseCase } from '../../application/usecases/listAdminSaleClaimsUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminSaleClaim } from '../../types/adminFinance';
import { AdminQueueFrame } from './AdminQueueFrame';
import { SaleClaimDecisionDialog } from './SaleClaimDecisionDialog';
import { SaleClaimQueueCard } from './SaleClaimQueueCard';

export function SaleClaimQueue({
  onNotice,
}: {
  onNotice: (message: string, error?: boolean) => void;
}) {
  const { t } = useTranslation();
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
        {queue.data.map((claim) => (
          <SaleClaimQueueCard key={claim.id} claim={claim} onDecide={setDeciding} />
        ))}
      </AdminQueueFrame>
      <SaleClaimDecisionDialog
        key={deciding?.id ?? 'none'}
        claim={deciding}
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
