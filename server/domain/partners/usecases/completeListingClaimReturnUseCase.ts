import { getListingClaimService } from '../factory';
import type { ListingClaimRecord } from '../types/listingClaim';

export function completeListingClaimReturnUseCase(
  actor: { uid: string; admin?: boolean },
  claim: ListingClaimRecord
): Promise<ListingClaimRecord> {
  return getListingClaimService().completeReturn(actor, claim);
}
