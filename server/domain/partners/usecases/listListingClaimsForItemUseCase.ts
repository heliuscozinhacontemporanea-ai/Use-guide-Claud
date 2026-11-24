import { getListingClaimService } from '../factory';
import type { ListingClaimRecord } from '../types/listingClaim';

export function listListingClaimsForItemUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<ListingClaimRecord[]> {
  return getListingClaimService().listForItem(actor, itemId);
}
