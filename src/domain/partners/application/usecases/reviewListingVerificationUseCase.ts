import { listingVerificationAdapter } from '../../factory';
import type {
  ListingVerificationView,
  VerificationDecision,
} from '../../types/listingVerification';

export function reviewListingVerificationUseCase(
  itemId: string,
  decision: VerificationDecision,
  reason: string | null
): Promise<ListingVerificationView> {
  return listingVerificationAdapter.review(itemId, decision, reason);
}
