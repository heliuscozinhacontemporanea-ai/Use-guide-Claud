import { getListingClaimService } from '../factory';
import type { ListingClaimRecord } from '../types/listingClaim';

/** Devolve os outros pedidos do mesmo lugar, recusados junto (D35, 5b). */
export function completeListingClaimApprovalUseCase(
  actor: { uid: string; admin?: boolean },
  claim: ListingClaimRecord
): Promise<ListingClaimRecord[]> {
  return getListingClaimService().completeApproval(actor, claim);
}
