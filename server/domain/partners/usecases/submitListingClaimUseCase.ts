import { getListingClaimService } from '../factory';
import type {
  ClaimableListing,
  ListingClaimView,
  SubmitListingClaimInput,
} from '../types/listingClaim';

export function submitListingClaimUseCase(
  claimantId: string,
  listing: ClaimableListing,
  input: SubmitListingClaimInput
): Promise<ListingClaimView> {
  return getListingClaimService().submit(claimantId, listing, input);
}
