import { getListingClaimService } from '../factory';
import type { ListingClaimView } from '../types/listingClaim';

export function listMyListingClaimsUseCase(claimantId: string): Promise<ListingClaimView[]> {
  return getListingClaimService().listMine(claimantId);
}
