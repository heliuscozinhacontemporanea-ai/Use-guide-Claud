import { useTranslation } from 'react-i18next';
import { ErrorState } from '../../../../ui/components/ErrorState';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { Skeleton } from '../../../../ui/components/Skeleton';
import { useListingClaimQueue } from '../../hooks/useListingClaimQueue';
import type { ListingClaimStatus } from '../../types/listingClaim';
import { ListingClaimCard } from './ListingClaimCard';

const FILTERS: ListingClaimStatus[] = ['pending', 'approved', 'rejected', 'returned'];

/** Pedidos de "Sou o dono" no painel do admin (D35), acima das verificações; montado pela composição. */
export function ListingClaimQueue() {
  const { t } = useTranslation();
  const queue = useListingClaimQueue();
  return (
    <section className="space-y-4" aria-labelledby="claim-queue-title">
      <h2 id="claim-queue-title" className="text-heading font-display font-bold text-ink">
        {t('claims.admin.tag')}
      </h2>
      <SegmentedControl<ListingClaimStatus>
        label={t('claims.admin.tag')}
        value={queue.status}
        onChange={queue.setStatus}
        options={FILTERS.map((status) => ({
          value: status,
          label:
            status === 'returned'
              ? t('claims.admin.returned')
              : t(`verification.admin.filters.${status}`),
        }))}
      />
      {queue.error ? (
        <ErrorState message={t('claims.errors.failed')} onRetry={() => void queue.reload()} />
      ) : queue.loading && queue.data.length === 0 ? (
        <Skeleton className="h-48 rounded-card" />
      ) : queue.data.length === 0 ? (
        <p className="py-8 text-center text-meta text-ink-muted">{t('claims.admin.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {queue.data.map((claim) => (
            <ListingClaimCard
              key={claim.claimId}
              claim={claim}
              onReview={(decision, reason) => queue.review(claim.claimId, decision, reason)}
              onReturn={() => queue.returnToUseGuide(claim.claimId)}
              onOpenFile={(kind) => void queue.openFile(claim.claimId, kind)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
