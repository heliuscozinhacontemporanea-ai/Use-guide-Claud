import type { EncryptedField } from '../../../shared/kernel/fieldEncryption';
import type {
  ListingDocumentType,
  ListingHolderRole,
  ListingVerificationFiles,
} from './listingVerification';

/** `returned`: aprovado e depois devolvido ao Use Guide pelo admin (D35, 6a). */
export type ListingClaimStatus = 'pending' | 'approved' | 'rejected' | 'returned';

/**
 * `listingClaims/{itemId}_{claimantId}` (D35 "Sou o dono"): só backend (rules `if false`). Os mesmos
 * campos da verificação (D12); o número do documento fica cifrado (classe Restrita, §7.6).
 */
export interface ListingClaimRecord {
  claimId: string;
  itemId: string;
  claimantId: string;
  documentType: ListingDocumentType;
  document: EncryptedField;
  documentIndex: string;
  maskedDocument: string;
  holderRole: ListingHolderRole;
  files: ListingVerificationFiles;
  cadastur: string | null;
  status: ListingClaimStatus;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface SubmitListingClaimInput {
  documentType: ListingDocumentType;
  document: string;
  holderRole: ListingHolderRole;
  files: Partial<ListingVerificationFiles>;
  cadastur?: string | null;
}

/** Anúncio que pode ser assumido: do Use Guide, de lugar, publicado e ativo. */
export interface ClaimableListing {
  id: string;
  ownerId: string;
  category: string;
  publication: string;
  isActive: boolean;
}

/** O que quem pede e o admin enxergam: nunca o número, só a forma mascarada. */
export interface ListingClaimView {
  claimId: string;
  itemId: string;
  claimantId: string;
  status: ListingClaimStatus;
  documentType: ListingDocumentType;
  maskedDocument: string;
  holderRole: ListingHolderRole;
  cadastur: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  filesSent: Array<keyof ListingVerificationFiles>;
}
