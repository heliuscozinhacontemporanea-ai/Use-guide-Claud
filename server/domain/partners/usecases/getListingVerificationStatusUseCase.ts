import { getListingVerificationService } from '../factory';
import type { ListingVerificationStatus } from '../types/listingVerification';

export function getListingVerificationStatusUseCase(
  itemId: string
): Promise<ListingVerificationStatus | 'not_submitted'> {
  return getListingVerificationService().getStatus(itemId);
}
