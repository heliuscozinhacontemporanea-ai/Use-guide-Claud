import { getListingVerificationService } from '../factory';
import type { ListingVerificationView, VerificationDecision } from '../types/listingVerification';

export function reviewListingVerificationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  decision: VerificationDecision,
  reason: string | null
): Promise<ListingVerificationView> {
  return getListingVerificationService().review(actor, itemId, decision, reason);
}
