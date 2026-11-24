import { getListingClaimService } from '../factory';
import type { ListingClaimRecord } from '../types/listingClaim';

export function getPendingListingClaimUseCase(
  actor: { uid: string; admin?: boolean },
  claimId: string
): Promise<ListingClaimRecord> {
  return getListingClaimService().pending(actor, claimId);
}
