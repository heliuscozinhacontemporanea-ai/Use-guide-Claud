import { useCallback, useEffect, useState } from 'react';
import { listListingClaimsUseCase } from '../application/usecases/listListingClaimsUseCase';
import { readListingClaimFileUseCase } from '../application/usecases/readListingClaimFileUseCase';
import { returnListingClaimUseCase } from '../application/usecases/returnListingClaimUseCase';
import { reviewListingClaimUseCase } from '../application/usecases/reviewListingClaimUseCase';
import type { AdminListingClaim, ListingClaimStatus } from '../types/listingClaim';
import type { VerificationDecision, VerificationFileKind } from '../types/listingVerification';

// O link do arquivo vale pouco tempo: o documento não fica aberto na memória do navegador.
const OBJECT_URL_TTL_MS = 60_000;

/** Fila do admin para os pedidos de "Sou o dono" (D35, telas 10 e 11). */
export function useListingClaimQueue() {
  const [status, setStatus] = useState<ListingClaimStatus>('pending');
  const [data, setData] = useState<AdminListingClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setData((await listListingClaimsUseCase(status, null)).data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const review = useCallback(
    async (claimId: string, decision: VerificationDecision, reason: string | null) => {
      await reviewListingClaimUseCase(claimId, decision, reason);
      await reload();
    },
    [reload]
  );

  const returnToUseGuide = useCallback(
    async (claimId: string) => {
      await returnListingClaimUseCase(claimId);
      await reload();
    },
    [reload]
  );

  const openFile = useCallback(async (claimId: string, kind: VerificationFileKind) => {
    const blob = await readListingClaimFileUseCase(claimId, kind);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), OBJECT_URL_TTL_MS);
  }, []);

  return { status, setStatus, data, loading, error, reload, review, returnToUseGuide, openFile };
}
