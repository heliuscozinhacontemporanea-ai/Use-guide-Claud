import { getListingClaimService } from '../factory';
import type { ListingVerificationFiles } from '../types/listingVerification';

export function getListingClaimFilePathUseCase(
  actor: { uid: string; admin?: boolean },
  claimId: string,
  kind: keyof ListingVerificationFiles
): Promise<string | null> {
  return getListingClaimService().getFilePath(actor, claimId, kind);
}
