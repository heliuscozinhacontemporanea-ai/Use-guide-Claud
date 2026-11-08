import { getListingVerificationService } from '../factory';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function listOwnerVerificationStatusesUseCase(
  ownerId: string
): Promise<Array<{ itemId: string; status: ListingVerificationStatus }>> {
  return getListingVerificationService().listOwnerStatuses(ownerId);
}
