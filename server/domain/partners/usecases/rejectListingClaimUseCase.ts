import { getListingClaimService } from '../factory';
import type { ListingClaimRecord } from '../types/listingClaim';

export function rejectListingClaimUseCase(
  actor: { uid: string; admin?: boolean },
  claimId: string,
  reason: string | null
): Promise<ListingClaimRecord> {
  return getListingClaimService().reject(actor, claimId, reason);
}
