import type {
  ListingDocumentType,
  ListingHolderRole,
  VerificationFileKind,
} from './listingVerification';

/** "Sou o dono" (D35). `returned`: aprovado e devolvido ao Use Guide pelo admin. */
export type ListingClaimStatus = 'pending' | 'approved' | 'rejected' | 'returned';

interface ListingClaimBase {
  claimId: string;
  itemId: string;
  status: ListingClaimStatus;
  documentType: ListingDocumentType;
  maskedDocument: string;
  holderRole: ListingHolderRole;
  cadastur: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  filesSent: VerificationFileKind[];
}

/** Pedido de quem pediu, para o Início do painel. */
export interface MyListingClaim extends ListingClaimBase {
  listingName: string;
}

/** Pedido na fila do admin, com os outros pedidos em análise para o mesmo lugar (5b). */
export interface AdminListingClaim extends ListingClaimBase {
  listing: { name: string; category: string; city: string | null };
  claimantName: string;
  otherClaims: Array<{
    claimantName: string;
    holderRole: ListingHolderRole;
    submittedAt: string;
  }>;
}

export interface SubmitListingClaimPayload {
  documentType: ListingDocumentType;
  document: string;
  holderRole: ListingHolderRole;
  files: Partial<Record<VerificationFileKind, string>>;
  cadastur: string | null;
  /** Só para quem ainda não é parceiro. */
  termsAccepted?: true;
}

/** O lugar que a pessoa quer assumir, como aparece no alto do pedido. */
export interface ClaimTarget {
  itemId: string;
  name: string;
  category: string;
  city: string | null;
  image: string | null;
}
