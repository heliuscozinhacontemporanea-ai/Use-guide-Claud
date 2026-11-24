import type { ListingClaimStatus, ListingClaimView } from '../../../domain/partners';

/** Pedido na fila do admin (D35, telas 10 e 11): o lugar, quem pediu e os outros pedidos do lugar. */
export interface AdminListingClaim extends Omit<ListingClaimView, 'claimantId'> {
  listing: { name: string; category: string; city: string | null };
  claimantName: string;
  otherClaims: Array<{
    claimantName: string;
    holderRole: ListingClaimView['holderRole'];
    submittedAt: string;
  }>;
}

/** Pedido de quem pediu, para o painel (D35, telas 8 e 9). */
export interface MyListingClaim extends Omit<ListingClaimView, 'claimantId'> {
  listingName: string;
}

export interface ListingClaimListQuery {
  status: ListingClaimStatus;
  limit: number;
  cursor: string | null;
}
