import { listingClaimAdapter } from '../../factory';
import type { VerificationDecision } from '../../types/listingVerification';

export function reviewListingClaimUseCase(
  claimId: string,
  decision: VerificationDecision,
  reason: string | null
): Promise<void> {
  return listingClaimAdapter.review(claimId, decision, reason);
}
