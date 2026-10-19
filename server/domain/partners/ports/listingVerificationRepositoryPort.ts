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
  /** Aprovação marca o documento como conferido e, no primeiro CNPJ aprovado, fixa o documento de vendas da conta. */
  saveReview(record: ListingVerificationRecord): Promise<void>;
  listByStatus(
    status: ListingVerificationStatus,
    limit: number,
    cursor: string | null
  ): Promise<ListingVerificationPage>;
  getSalesDocumentIndex(ownerId: string): Promise<string | null>;
  /** Apaga o registro e libera o CNPJ; devolve o registro apagado (para remover os arquivos). */
  delete(itemId: string): Promise<ListingVerificationRecord | null>;
  deleteByOwner(ownerId: string): Promise<ListingVerificationRecord[]>;
}
