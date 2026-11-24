import { getListingClaimService } from '../factory';
import type { ListingClaimRecord, ListingClaimStatus } from '../types/listingClaim';

export function listListingClaimsForReviewUseCase(
  actor: { uid: string; admin?: boolean },
  status: ListingClaimStatus,
  limit: number,
  cursor: string | null
): Promise<{ data: ListingClaimRecord[]; nextCursor: string | null }> {
  return getListingClaimService().listForReview(actor, status, limit, cursor);
}
