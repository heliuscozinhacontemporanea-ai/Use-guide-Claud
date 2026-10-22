import { getListingVerificationService } from '../factory';
import type {
  ListingVerificationStatus,
  ListingVerificationView,
} from '../types/listingVerification';

export function listListingVerificationsUseCase(
  actor: { uid: string; admin?: boolean },
  status: ListingVerificationStatus,
  limit: number,
  cursor: string | null
): Promise<{ data: ListingVerificationView[]; nextCursor: string | null }> {
  return getListingVerificationService().listForReview(actor, status, limit, cursor);
}
