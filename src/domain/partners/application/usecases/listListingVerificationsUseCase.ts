import { listingVerificationAdapter } from '../../factory';
import type {
  ListingVerificationQueuePage,
  ListingVerificationStatus,
} from '../../types/listingVerification';

export function listListingVerificationsUseCase(
  status: ListingVerificationStatus,
  cursor: string | null
): Promise<ListingVerificationQueuePage> {
  return listingVerificationAdapter.list(status, cursor);
}
