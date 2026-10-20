import { getListingVerificationService } from '../factory';
import type { ListingVerificationView, VerificationListing } from '../types/listingVerification';

export function getListingVerificationUseCase(
  actor: { uid: string; admin?: boolean },
  listing: VerificationListing
): Promise<ListingVerificationView> {
  return getListingVerificationService().getView(actor, listing);
}
