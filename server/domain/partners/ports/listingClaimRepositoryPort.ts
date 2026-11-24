import type { ListingClaimRecord, ListingClaimStatus } from '../types/listingClaim';

export interface ListingClaimPage {
  data: ListingClaimRecord[];
  nextCursor: string | null;
}

export interface ListingClaimRepositoryPort {
  get(claimId: string): Promise<ListingClaimRecord | null>;
  save(record: ListingClaimRecord): Promise<void>;
  listByStatus(
    status: ListingClaimStatus,
    limit: number,
    cursor: string | null
  ): Promise<ListingClaimPage>;
  listByItem(itemId: string): Promise<ListingClaimRecord[]>;
  listByClaimant(claimantId: string): Promise<ListingClaimRecord[]>;
  /**
   * Aprova o pedido e recusa, na mesma transação, os outros pedidos em análise para o mesmo lugar
   * (D35, 5b). Recusa se o pedido não estiver mais em análise. Devolve os pedidos recusados.
   */
  approve(
    claimId: string,
    reviewedAt: string,
    reviewedBy: string,
    siblingReason: string
  ): Promise<ListingClaimRecord[]>;
  saveReview(record: ListingClaimRecord): Promise<void>;
  /** Apaga os pedidos de quem exclui a conta; devolve os apagados (para remover os arquivos). */
  deleteByClaimant(claimantId: string): Promise<ListingClaimRecord[]>;
}
