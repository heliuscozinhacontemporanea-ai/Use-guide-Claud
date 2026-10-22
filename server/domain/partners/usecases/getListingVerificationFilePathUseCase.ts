import { getListingVerificationService } from '../factory';
import type { ListingVerificationFiles } from '../types/listingVerification';

export function getListingVerificationFilePathUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  kind: keyof ListingVerificationFiles
): Promise<string | null> {
  return getListingVerificationService().getFilePath(actor, itemId, kind);
}
