import { listingClaimAdapter } from '../../factory';
import type { AdminListingClaim, ListingClaimStatus } from '../../types/listingClaim';

export function listListingClaimsUseCase(
  status: ListingClaimStatus,
  cursor: string | null
): Promise<{ data: AdminListingClaim[]; nextCursor: string | null }> {
  return listingClaimAdapter.listForReview(status, cursor);
}
