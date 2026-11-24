import { listingClaimAdapter } from '../../factory';
import type { MyListingClaim } from '../../types/listingClaim';

export function listMyListingClaimsUseCase(): Promise<MyListingClaim[]> {
  return listingClaimAdapter.listMine();
}
