import { listingClaimAdapter } from '../../factory';
import type { VerificationFileKind } from '../../types/listingVerification';

export function readListingClaimFileUseCase(
  claimId: string,
  kind: VerificationFileKind
): Promise<Blob> {
  return listingClaimAdapter.readFile(claimId, kind);
}
