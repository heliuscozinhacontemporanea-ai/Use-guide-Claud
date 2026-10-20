import { listingVerificationAdapter } from '../../factory';
import type { ListingVerificationView } from '../../types/listingVerification';

export function getListingVerificationUseCase(itemId: string): Promise<ListingVerificationView> {
  return listingVerificationAdapter.get(itemId);
}
