import type {
  ListingVerificationQueuePage,
  ListingVerificationStatus,
  ListingVerificationView,
  SubmitListingVerificationPayload,
  VerificationDecision,
  VerificationFileKind,
} from '../types/listingVerification';

export interface ListingVerificationPort {
  get(itemId: string): Promise<ListingVerificationView>;
  submit(
    itemId: string,
    payload: SubmitListingVerificationPayload
  ): Promise<ListingVerificationView>;
  list(
    status: ListingVerificationStatus,
    cursor: string | null
  ): Promise<ListingVerificationQueuePage>;
  review(
    itemId: string,
    decision: VerificationDecision,
    reason: string | null
  ): Promise<ListingVerificationView>;
  /** Arquivo privado lido pelo admin; nunca vira URL pública. */
  readFile(itemId: string, kind: VerificationFileKind): Promise<Blob>;
}
