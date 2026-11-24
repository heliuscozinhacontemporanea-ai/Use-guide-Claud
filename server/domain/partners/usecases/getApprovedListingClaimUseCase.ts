import { getListingClaimService } from '../factory';
import type { ListingClaimRecord } from '../types/listingClaim';

export function getApprovedListingClaimUseCase(
  actor: { uid: string; admin?: boolean },
  claimId: string
): Promise<ListingClaimRecord> {
  return getListingClaimService().approved(actor, claimId);
}
