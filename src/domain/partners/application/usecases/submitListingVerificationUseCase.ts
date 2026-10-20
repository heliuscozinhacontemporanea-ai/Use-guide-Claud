import { listingVerificationAdapter } from '../../factory';
import type {
  ListingVerificationView,
  SubmitListingVerificationPayload,
} from '../../types/listingVerification';

export function submitListingVerificationUseCase(
  itemId: string,
  payload: SubmitListingVerificationPayload
): Promise<ListingVerificationView> {
  return listingVerificationAdapter.submit(itemId, payload);
}
