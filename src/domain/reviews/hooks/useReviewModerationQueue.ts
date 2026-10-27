import { useCallback, useEffect, useState } from 'react';
import { decideReviewReportUseCase } from '../application/usecases/decideReviewReportUseCase';
import { listOpenReviewReportsUseCase } from '../application/usecases/listOpenReviewReportsUseCase';
import type { ModerationReviewReport, ReviewReportOutcome } from '../types/reviewReport';

/** Fila de denúncias abertas do admin; decidir tira a denúncia da fila. */
export function useReviewModerationQueue() {
  const [data, setData] = useState<ModerationReviewReport[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (cursor: string | null) => {
    setLoading(true);
    setError(false);
    try {
      const page = await listOpenReviewReportsUseCase(cursor);
      setData((current) => (cursor ? [...current, ...page.data] : page.data));
      setNextCursor(page.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(null);
  }, [load]);

  const decide = useCallback(async (reportId: string, outcome: ReviewReportOutcome) => {
    await decideReviewReportUseCase(reportId, outcome);
    setData((current) => current.filter((report) => report.id !== reportId));
  }, []);

  return {
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    decide,
  };
}
