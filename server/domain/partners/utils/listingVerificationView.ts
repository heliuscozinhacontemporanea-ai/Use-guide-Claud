import type {
  ListingVerificationFiles,
  ListingVerificationRecord,
  ListingVerificationView,
  VerificationListing,
} from '../types/listingVerification';

const PRODUCER_CATEGORY = 'producer';

/** Visão de quem ainda não enviou: o perfil de produtor já nasce no modo "usar documento de outro". */
export function notSubmittedView(listing: VerificationListing): ListingVerificationView {
  return {
    itemId: listing.id,
    ownerId: listing.ownerId,
    mode: listing.category === PRODUCER_CATEGORY ? 'linked' : 'document',
    sourceItemId: null,
    status: 'not_submitted',
    documentType: null,
    maskedDocument: null,
    holderRole: null,
    cadastur: null,
    rejectionReason: null,
    submittedAt: null,
    reviewedAt: null,
    filesSent: [],
  };
}

/** Allowlist de saída (§7.9 item 4): nunca o documento cifrado nem o índice. */
export function toListingVerificationView(
  record: ListingVerificationRecord
): ListingVerificationView {
  return {
    itemId: record.itemId,
    ownerId: record.ownerId,
    mode: record.mode,
    sourceItemId: record.sourceItemId,
    status: record.status,
    documentType: record.documentType,
    maskedDocument: record.maskedDocument,
    holderRole: record.holderRole,
    cadastur: record.cadastur,
    rejectionReason: record.rejectionReason,
    submittedAt: record.submittedAt,
    reviewedAt: record.reviewedAt,
    filesSent: (Object.keys(record.files) as Array<keyof ListingVerificationFiles>).filter((kind) =>
      Boolean(record.files[kind])
    ),
  };
}
