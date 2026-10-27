import { useCallback, useEffect, useState } from 'react';
import { listMyReviewReportsUseCase } from '../application/usecases/listMyReviewReportsUseCase';
import { reportReviewResponseUseCase } from '../application/usecases/reportReviewResponseUseCase';
import type { MyReviewReport, ReviewReportReason } from '../types/reviewReport';

/** Denúncias da própria pessoa, a mais recente de cada avaliação, para o status no cartão. */
export function useMyReviewReports() {
  const [reports, setReports] = useState<MyReviewReport[]>([]);

  useEffect(() => {
    let active = true;
    listMyReviewReportsUseCase()
      .then((data) => {
        if (active) setReports(data);
      })
      // Sem a lista, o cartão só não mostra o status; a denúncia repetida o backend recusa.
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const latestFor = useCallback(
    (reviewId: string) =>
      reports
        .filter((report) => report.reviewId === reviewId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0],
    [reports]
  );

  const report = useCallback(
    async (reviewId: string, reason: ReviewReportReason, details?: string) => {
      const created = await reportReviewResponseUseCase({ reviewId, reason, details });
      setReports((current) => [created, ...current]);
    },
    []
  );

  return { latestFor, report };
}
