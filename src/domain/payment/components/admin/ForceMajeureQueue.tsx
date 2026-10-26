import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog, type ConfirmDialogData } from '../../../../ui/components/ConfirmDialog';
import { decideForceMajeureUseCase } from '../../application/usecases/decideForceMajeureUseCase';
import { listForceMajeureReviewsUseCase } from '../../application/usecases/listForceMajeureReviewsUseCase';
import { readForceMajeureProofUseCase } from '../../application/usecases/readForceMajeureProofUseCase';
import { useAdminFinanceQueue } from '../../hooks/useAdminFinanceQueue';
import type { AdminForceMajeureReview } from '../../types/adminFinance';
import { adminFinanceErrorKey, errorCodeOf } from '../../utils/adminFinanceErrors';
import { AdminQueueFrame } from './AdminQueueFrame';
import { ForceMajeureReviewCard } from './ForceMajeureReviewCard';

const OBJECT_URL_TTL_MS = 60_000;

async function listAll() {
  return { data: await listForceMajeureReviewsUseCase(), nextCursor: null };
}

export function ForceMajeureQueue({
  onNotice,
}: {
  onNotice: (message: string, error?: boolean) => void;
}) {
  const { t } = useTranslation();
  const queue = useAdminFinanceQueue(listAll);
  const [confirm, setConfirm] = useState<ConfirmDialogData | null>(null);
  const [busy, setBusy] = useState(false);

  const openProof = async (review: AdminForceMajeureReview) => {
    try {
      const url = URL.createObjectURL(await readForceMajeureProofUseCase(review.id));
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_TTL_MS);
    } catch (err) {
      onNotice(t(adminFinanceErrorKey(errorCodeOf(err))), true);
    }
  };

  const decide = (review: AdminForceMajeureReview, approve: boolean) =>
    setConfirm({
      message: t(
        approve
          ? 'adminFinance.forceMajeure.approveConfirm'
          : 'adminFinance.forceMajeure.rejectConfirm'
      ),
      tone: approve ? 'positive' : 'danger',
      confirmLabel: t(
        approve ? 'adminFinance.forceMajeure.approve' : 'adminFinance.forceMajeure.reject'
      ),
      onCancel: () => setConfirm(null),
      onConfirm: async () => {
        setConfirm(null);
        setBusy(true);
        try {
          await decideForceMajeureUseCase(review.id, approve);
          onNotice(
            t(approve ? 'adminFinance.forceMajeure.approved' : 'adminFinance.forceMajeure.rejected')
          );
          await queue.reload();
        } catch (err) {
          onNotice(t(adminFinanceErrorKey(errorCodeOf(err))), true);
        } finally {
          setBusy(false);
        }
      },
    });

  return (
    <>
      <AdminQueueFrame
        hint={t('adminFinance.forceMajeure.hint')}
        loading={queue.loading}
        error={queue.error}
        empty={queue.data.length === 0}
        emptyMessage={t('adminFinance.forceMajeure.empty')}
        hasMore={false}
        onRetry={() => void queue.reload()}
        onLoadMore={() => undefined}
      >
        {queue.data.map((review) => (
          <ForceMajeureReviewCard
            key={review.id}
            review={review}
            busy={busy}
            onOpenProof={(entry) => void openProof(entry)}
            onDecide={decide}
          />
        ))}
      </AdminQueueFrame>
      <ConfirmDialog data={confirm} />
    </>
  );
}
