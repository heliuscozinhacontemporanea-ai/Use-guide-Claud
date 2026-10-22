import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { ErrorState } from '../../../../ui/components/ErrorState';
import { Skeleton } from '../../../../ui/components/Skeleton';
import { useVerificationQueue } from '../../hooks/useVerificationQueue';
import type { ListingVerificationStatus } from '../../types/listingVerification';
import { VerificationQueueCard } from './VerificationQueueCard';

const FILTERS: ListingVerificationStatus[] = ['pending', 'approved', 'rejected'];

/** Fila de verificação do admin (D12); montada no painel admin pela composição do app. */
export function ListingVerificationQueue() {
  const { t } = useTranslation();
  const queue = useVerificationQueue();

  return (
    <section className="space-y-6" aria-labelledby="verification-queue-title">
      <h2 id="verification-queue-title" className="text-xl font-display font-bold text-white/80">
        {t('verification.admin.title')}
      </h2>

      <div
        role="group"
        aria-label={t('verification.admin.filterLabel')}
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={queue.status === status}
            onClick={() => queue.setStatus(status)}
            className={cn(
              'min-h-[44px] px-4 rounded-2xl text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-teal-400/50',
              queue.status === status
                ? 'bg-teal-500 text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            )}
          >
            {t(`verification.admin.filters.${status}`)}
          </button>
        ))}
      </div>

      {queue.error ? (
        <ErrorState message={queue.error} onRetry={() => void queue.reload()} />
      ) : queue.loading && queue.data.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      ) : queue.data.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/60 border-2 border-dashed border-white/5 rounded-3xl">
          {t('verification.admin.empty')}
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {queue.data.map((entry) => (
            <VerificationQueueCard
              key={entry.itemId}
              entry={entry}
              onReview={(decision, reason) => queue.review(entry.itemId, decision, reason)}
              onOpenFile={(kind) => queue.openFile(entry.itemId, kind)}
            />
          ))}
        </div>
      )}

      {queue.hasMore && !queue.error && (
        <button
          type="button"
          disabled={queue.loading}
          onClick={() => void queue.loadMore()}
          className="min-h-[44px] w-full rounded-2xl border border-white/10 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-teal-400/50"
        >
          {t('verification.admin.loadMore')}
        </button>
      )}
    </section>
  );
}
