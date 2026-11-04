import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListEmpty, ListError, ListLoading } from '../../../../ui/components/ListState';
import { ListCard, ListRowButton } from '../../../../ui/components/ListRows';
import { getReviewsUseCase } from '../../application/usecases/getReviewsUseCase';
import type { FirestoreReview } from '../../types/review';

const RECENT = 3;

/** Últimas avaliações de um item na página do estabelecimento (p19); o toque leva às respostas. */
export function RecentItemReviews({ itemId, onOpen }: { itemId: string; onOpen: () => void }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<FirestoreReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      setReviews((await getReviewsUseCase(itemId, RECENT, 'recent')).items);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <ListLoading label={t('reviewReports.recent.loading')} />;
  if (failed) return <ListError message={t('reviewReports.recent.error')} onRetry={load} />;
  if (reviews.length === 0) return <ListEmpty message={t('reviewReports.recent.empty')} />;
  return (
    <ListCard>
      {reviews.map((review) => (
        <ListRowButton
          key={review.id}
          title={`${review.userName} · ${review.rating} ★`}
          sub={review.comment}
          status={
            review.partnerResponse
              ? { tone: 'muted', text: t('reviewReports.recent.replied') }
              : { tone: 'info', text: t('reviewReports.recent.noReply') }
          }
          onClick={onOpen}
        />
      ))}
    </ListCard>
  );
}
