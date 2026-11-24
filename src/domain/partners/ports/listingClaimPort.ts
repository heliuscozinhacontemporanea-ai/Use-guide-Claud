import type {
  AdminListingClaim,
  ListingClaimStatus,
  MyListingClaim,
  SubmitListingClaimPayload,
} from '../types/listingClaim';
import type { VerificationDecision, VerificationFileKind } from '../types/listingVerification';

export interface ListingClaimPort {
  submit(itemId: string, payload: SubmitListingClaimPayload): Promise<void>;
  listMine(): Promise<MyListingClaim[]>;
  listForReview(
    status: ListingClaimStatus,
    cursor: string | null
  ): Promise<{ data: AdminListingClaim[]; nextCursor: string | null }>;
  review(claimId: string, decision: VerificationDecision, reason: string | null): Promise<void>;
  returnToUseGuide(claimId: string): Promise<void>;
  readFile(claimId: string, kind: VerificationFileKind): Promise<Blob>;
}
