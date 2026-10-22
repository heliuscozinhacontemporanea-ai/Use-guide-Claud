export type ListingDocumentType = 'cpf' | 'cnpj';
export type ListingVerificationStatus = 'pending' | 'approved' | 'rejected';
/** `owner`: sócio, administrador ou titular do MEI; `representative`: gerente com autorização de um sócio. */
export type ListingHolderRole = 'owner' | 'representative';
export type VerificationFileKind = 'cnpjCard' | 'identity' | 'authorization';
export type VerificationDecision = 'approve' | 'reject';

/** O que a API devolve: nunca o número do documento, só a forma mascarada (AGENTS.md §7.6). */
export interface ListingVerificationView {
  itemId: string;
  ownerId: string;
  mode: 'document' | 'linked';
  sourceItemId: string | null;
  status: ListingVerificationStatus | 'not_submitted';
  documentType: ListingDocumentType | null;
  maskedDocument: string | null;
  holderRole: ListingHolderRole | null;
  cadastur: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  filesSent: VerificationFileKind[];
}

export interface ListingVerificationQueueEntry extends ListingVerificationView {
  listingName: string;
  listingCategory: string;
  ownerName: string;
}

export type SubmitListingVerificationPayload =
  | {
      mode: 'document';
      documentType: ListingDocumentType;
      document: string;
      holderRole?: ListingHolderRole;
      files?: Partial<Record<VerificationFileKind, string>>;
      cadastur?: string | null;
    }
  | { mode: 'linked'; sourceItemId: string };

export interface ListingVerificationQueuePage {
  data: ListingVerificationQueueEntry[];
  nextCursor: string | null;
}
