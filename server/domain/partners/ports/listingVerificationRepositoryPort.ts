import type {
  ListingVerificationRecord,
  ListingVerificationStatus,
  VerificationDocumentEntry,
} from '../types/listingVerification';

export interface ListingVerificationPage {
  data: ListingVerificationRecord[];
  nextCursor: string | null;
}

export interface ListingVerificationRepositoryPort {
  get(itemId: string): Promise<ListingVerificationRecord | null>;
  getDocumentEntry(documentIndex: string): Promise<VerificationDocumentEntry | null>;
  /**
   * Grava o envio e reserva o documento na mesma transação. Recusa documento de outra conta e CNPJ já
   * usado por outro estabelecimento; libera o CNPJ anterior quando o estabelecimento troca de documento.
   */
  saveSubmission(record: ListingVerificationRecord): Promise<void>;
  /** Aprovação marca o documento como conferido. */
  saveReview(record: ListingVerificationRecord): Promise<void>;
  listByStatus(
    status: ListingVerificationStatus,
    limit: number,
    cursor: string | null
  ): Promise<ListingVerificationPage>;
  listByOwner(ownerId: string): Promise<ListingVerificationRecord[]>;
  /** Perfis de produtor que usam o documento deste estabelecimento (modo `linked`). */
  listLinkedItemIds(sourceItemId: string): Promise<string[]>;
  /** Apaga o registro e libera o CNPJ; devolve o registro apagado (para remover os arquivos). */
  delete(itemId: string): Promise<ListingVerificationRecord | null>;
  deleteByOwner(ownerId: string): Promise<ListingVerificationRecord[]>;
}
