import { getListingVerificationService } from '../factory';
import type {
  ListingVerificationView,
  SubmitListingVerificationInput,
  VerificationListing,
} from '../types/listingVerification';

export function submitListingVerificationUseCase(
  actor: { uid: string; admin?: boolean },
  listing: VerificationListing,
  input: SubmitListingVerificationInput,
  source: VerificationListing | null
): Promise<ListingVerificationView> {
  return getListingVerificationService().submit(actor, listing, input, source);
}
