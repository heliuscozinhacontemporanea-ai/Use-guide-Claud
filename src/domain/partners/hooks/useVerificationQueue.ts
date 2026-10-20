import { useCallback, useEffect, useState } from 'react';
import { listListingVerificationsUseCase } from '../application/usecases/listListingVerificationsUseCase';
import { readVerificationFileUseCase } from '../application/usecases/readVerificationFileUseCase';
import { reviewListingVerificationUseCase } from '../application/usecases/reviewListingVerificationUseCase';
import type {
  ListingVerificationQueueEntry,
  ListingVerificationStatus,
  VerificationFileKind,
} from '../types/listingVerification';
import { getVerificationErrorMessage } from '../utils/verificationErrorMessage';

// Tempo para a aba nova carregar o arquivo antes de liberar a URL temporária.
const OBJECT_URL_TTL_MS = 60_000;

export function useVerificationQueue() {
  const [status, setStatus] = useState<ListingVerificationStatus>('pending');
  const [data, setData] = useState<ListingVerificationQueueEntry[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (cursor: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const page = await listListingVerificationsUseCase(status, cursor);
        setData((current) => (cursor ? [...current, ...page.data] : page.data));
        setNextCursor(page.nextCursor);
      } catch (err: unknown) {
        setError(getVerificationErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    void load(null);
  }, [load]);

  const review = useCallback(
    async (itemId: string, decision: 'approve' | 'reject', reason: string | null) => {
      try {
        await reviewListingVerificationUseCase(itemId, decision, reason);
      } catch (err: unknown) {
        throw new Error(getVerificationErrorMessage(err));
      }
      // Revisada, a verificação sai da lista atual.
      setData((current) => current.filter((entry) => entry.itemId !== itemId));
    },
    []
  );

  const openFile = useCallback(async (itemId: string, kind: VerificationFileKind) => {
    const blob = await readVerificationFileUseCase(itemId, kind);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_TTL_MS);
  }, []);

  return {
    status,
    setStatus,
    data,
    loading,
    error,
    hasMore: nextCursor !== null,
    reload: () => load(null),
    loadMore: () => load(nextCursor),
    review,
    openFile,
  };
}
