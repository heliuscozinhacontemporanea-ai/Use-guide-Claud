import type { EncryptedField } from '../../../shared/kernel/fieldEncryption';

export type ListingDocumentType = 'cpf' | 'cnpj';
export type ListingVerificationStatus = 'pending' | 'approved' | 'rejected';
/** `owner`: sócio, administrador ou titular do MEI; `representative`: gerente com autorização de um sócio. */
export type ListingHolderRole = 'owner' | 'representative';
/** `linked`: perfil de produtor que usa o documento de outro estabelecimento da conta (D12). */
export type ListingVerificationMode = 'document' | 'linked';

export interface ListingVerificationFiles {
  cnpjCard: string | null;
  identity: string | null;
  authorization: string | null;
}

/** `listingVerifications/{itemId}`: só backend. O número do documento fica cifrado (classe Restrita, §7.6). */
export interface ListingVerificationRecord {
  itemId: string;
  ownerId: string;
  mode: ListingVerificationMode;
  sourceItemId: string | null;
  documentType: ListingDocumentType | null;
  document: EncryptedField | null;
  documentIndex: string | null;
  maskedDocument: string | null;
  holderRole: ListingHolderRole | null;
  files: ListingVerificationFiles;
  cadastur: string | null;
  status: ListingVerificationStatus;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

/** `verificationDocuments/{documentIndex}`: um documento pertence a uma conta; CNPJ a um estabelecimento. */
export interface VerificationDocumentEntry {
  documentIndex: string;
  ownerId: string;
  documentType: ListingDocumentType;
  itemId: string | null;
  verifiedAt: string | null;
}

export interface SubmitListingVerificationInput {
  mode: ListingVerificationMode;
  sourceItemId?: string;
  documentType?: ListingDocumentType;
  document?: string;
  holderRole?: ListingHolderRole;
  files?: Partial<ListingVerificationFiles>;
  cadastur?: string | null;
}

export interface VerificationListing {
  id: string;
  ownerId: string;
  category: string;
}

/** O que o dono e o admin enxergam: nunca o número, só a forma mascarada. */
export interface ListingVerificationView {
  itemId: string;
  ownerId: string;
  mode: ListingVerificationMode;
  sourceItemId: string | null;
  status: ListingVerificationStatus | 'not_submitted';
  documentType: ListingDocumentType | null;
  maskedDocument: string | null;
  holderRole: ListingHolderRole | null;
  cadastur: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  filesSent: Array<keyof ListingVerificationFiles>;
}

export type VerificationDecision = 'approve' | 'reject';

/** Conta de recebimento de quem vende: `accountKey` é o índice cego do CNPJ (D14). */
export interface ListingSalesAccount {
  accountKey: string;
}

export interface OwnerSalesDocument {
  accountKey: string;
  maskedDocument: string;
  itemIds: string[];
}
