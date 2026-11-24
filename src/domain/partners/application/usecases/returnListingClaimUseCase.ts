import { listingClaimAdapter } from '../../factory';

export function returnListingClaimUseCase(claimId: string): Promise<void> {
  return listingClaimAdapter.returnToUseGuide(claimId);
}
