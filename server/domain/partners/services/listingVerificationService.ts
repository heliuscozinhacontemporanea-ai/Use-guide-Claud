import type { BlindIndexPort, FieldEncryptionPort } from '../../../shared/kernel/fieldEncryption';
import { ListingVerificationError } from '../errors/listingVerificationError';
import type {
  ListingVerificationPage,
  ListingVerificationRepositoryPort,
} from '../ports/listingVerificationRepositoryPort';
import type {
  ListingDocumentType,
  ListingVerificationFiles,
  ListingVerificationRecord,
  ListingVerificationStatus,
  ListingVerificationView,
  SubmitListingVerificationInput,
  VerificationDecision,
  VerificationListing,
} from '../types/listingVerification';
import { notSubmittedView, toListingVerificationView } from '../utils/listingVerificationView';
import { maskDocument } from '../utils/maskDocument';
import { isValidCNPJ, isValidCPF, normalizeDocument } from './documentIdentity';

const PRODUCER_CATEGORY = 'producer';
const MIN_REJECTION_REASON = 5;
const EMPTY_FILES: ListingVerificationFiles = {
  cnpjCard: null,
  identity: null,
  authorization: null,
};

interface Actor {
  uid: string;
  admin?: boolean;
}

/** Verificação de cada estabelecimento pelo admin (D12): documento, prova do CNPJ e vínculo pessoa-empresa. */
export class ListingVerificationService {
  constructor(
    private readonly repository: ListingVerificationRepositoryPort,
    private readonly encryption: FieldEncryptionPort,
    private readonly blindIndex: BlindIndexPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async submit(
    actor: Actor,
    listing: VerificationListing,
    input: SubmitListingVerificationInput,
    source: VerificationListing | null
  ): Promise<ListingVerificationView> {
    if (listing.ownerId !== actor.uid) {
      throw new ListingVerificationError(
        'FORBIDDEN',
        'Só o dono do estabelecimento envia a verificação.'
      );
    }
    const record =
      listing.category === PRODUCER_CATEGORY
        ? this.linkedRecord(listing, input, source)
        : await this.documentRecord(listing, input);
    await this.repository.saveSubmission(record);
    return toListingVerificationView(await this.resolve(record));
  }

  async review(
    actor: Actor,
    itemId: string,
    decision: VerificationDecision,
    reason: string | null
  ): Promise<ListingVerificationView> {
    if (!actor.admin) {
      throw new ListingVerificationError(
        'FORBIDDEN',
        'Somente administradores revisam verificações.'
      );
    }
    const record = await this.repository.get(itemId);
    if (record?.mode !== 'document') {
      throw new ListingVerificationError('NOT_FOUND', 'Verificação não encontrada.');
    }
    if (record.status !== 'pending') {
      throw new ListingVerificationError('NOT_PENDING', 'Esta verificação já foi revisada.');
    }
    const trimmedReason = reason?.trim() ?? '';
    if (decision === 'reject' && trimmedReason.length < MIN_REJECTION_REASON) {
      throw new ListingVerificationError('VALIDATION_ERROR', 'Informe o motivo da recusa.');
    }
    const reviewed: ListingVerificationRecord = {
      ...record,
      status: decision === 'approve' ? 'approved' : 'rejected',
      rejectionReason: decision === 'reject' ? trimmedReason : null,
      reviewedAt: this.now().toISOString(),
      reviewedBy: actor.uid,
    };
    await this.repository.saveReview(reviewed);
    return toListingVerificationView(reviewed);
  }

  async getView(actor: Actor, listing: VerificationListing): Promise<ListingVerificationView> {
    if (!actor.admin && listing.ownerId !== actor.uid) {
      throw new ListingVerificationError('FORBIDDEN', 'Sem acesso a esta verificação.');
    }
    const record = await this.repository.get(listing.id);
    if (!record) return notSubmittedView(listing);
    return toListingVerificationView(await this.resolve(record));
  }

  async listForReview(
    actor: Actor,
    status: ListingVerificationStatus,
    limit: number,
    cursor: string | null
  ): Promise<{ data: ListingVerificationView[]; nextCursor: string | null }> {
    if (!actor.admin) {
      throw new ListingVerificationError(
        'FORBIDDEN',
        'Somente administradores revisam verificações.'
      );
    }
    const page: ListingVerificationPage = await this.repository.listByStatus(status, limit, cursor);
    return { data: page.data.map(toListingVerificationView), nextCursor: page.nextCursor };
  }

  /** Caminho de um arquivo enviado, para o admin abrir pelo backend. */
  async getFilePath(
    actor: Actor,
    itemId: string,
    kind: keyof ListingVerificationFiles
  ): Promise<string | null> {
    if (!actor.admin) {
      throw new ListingVerificationError('FORBIDDEN', 'Somente administradores abrem documentos.');
    }
    const record = await this.repository.get(itemId);
    return record?.files[kind] ?? null;
  }

  async getStatus(itemId: string): Promise<ListingVerificationStatus | 'not_submitted'> {
    const record = await this.repository.get(itemId);
    if (!record) return 'not_submitted';
    return (await this.resolve(record)).status;
  }

  /**
   * Venda exige estabelecimento verificado com CNPJ (D12). Até o Prompt 18.4 (conta Stripe por documento),
   * só vende o CNPJ fixado como documento de vendas da conta, para o dinheiro não cair em outra empresa.
   */
  async assertCanSell(itemId: string): Promise<void> {
    const stored = await this.repository.get(itemId);
    const record = stored ? await this.resolve(stored) : null;
    if (record?.status !== 'approved') {
      throw new ListingVerificationError(
        'LISTING_NOT_VERIFIED',
        'O estabelecimento precisa ser verificado pelo Use Guide antes de vender.'
      );
    }
    if (record.documentType !== 'cnpj') {
      throw new ListingVerificationError(
        'CPF_CANNOT_SELL',
        'Para vender é preciso cadastrar o estabelecimento com CNPJ (MEI serve).'
      );
    }
    const salesDocument = await this.repository.getSalesDocumentIndex(record.ownerId);
    if (salesDocument && salesDocument !== record.documentIndex) {
      throw new ListingVerificationError(
        'SALES_DOCUMENT_MISMATCH',
        'Por enquanto só um CNPJ por conta pode vender.'
      );
    }
  }

  async deleteForListing(itemId: string): Promise<string[]> {
    const removed = await this.repository.delete(itemId);
    return removed ? filePaths(removed) : [];
  }

  async deleteForOwner(ownerId: string): Promise<string[]> {
    const removed = await this.repository.deleteByOwner(ownerId);
    return removed.flatMap(filePaths);
  }

  private linkedRecord(
    listing: VerificationListing,
    input: SubmitListingVerificationInput,
    source: VerificationListing | null
  ): ListingVerificationRecord {
    if (input.mode !== 'linked' || !input.sourceItemId) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'O perfil de produtor usa o documento de um estabelecimento da conta.'
      );
    }
    if (!source || source.id !== input.sourceItemId || source.ownerId !== listing.ownerId) {
      throw new ListingVerificationError('FORBIDDEN', 'Escolha um estabelecimento da sua conta.');
    }
    if (source.category === PRODUCER_CATEGORY) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Escolha um estabelecimento, não um perfil.'
      );
    }
    return {
      itemId: listing.id,
      ownerId: listing.ownerId,
      mode: 'linked',
      sourceItemId: source.id,
      documentType: null,
      document: null,
      documentIndex: null,
      maskedDocument: null,
      holderRole: null,
      files: { ...EMPTY_FILES },
      cadastur: null,
      status: 'pending',
      rejectionReason: null,
      submittedAt: this.now().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    };
  }

  private async documentRecord(
    listing: VerificationListing,
    input: SubmitListingVerificationInput
  ): Promise<ListingVerificationRecord> {
    if (input.mode !== 'document' || !input.documentType || !input.document) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Informe o CPF ou o CNPJ do estabelecimento.'
      );
    }
    const type = input.documentType;
    const normalized = normalizeDocument(input.document);
    const valid = type === 'cpf' ? isValidCPF(normalized) : isValidCNPJ(normalized);
    if (!valid) {
      throw new ListingVerificationError('VALIDATION_ERROR', `${type.toUpperCase()} inválido.`);
    }
    const documentIndex = this.blindIndex.indexFor(type, normalized);
    const [existing, entry] = await Promise.all([
      this.repository.get(listing.id),
      this.repository.getDocumentEntry(documentIndex),
    ]);
    if (existing?.status === 'approved' && existing.documentIndex === documentIndex) {
      throw new ListingVerificationError(
        'ALREADY_VERIFIED',
        'Este estabelecimento já está verificado.'
      );
    }
    if (entry && entry.ownerId !== listing.ownerId) {
      throw new ListingVerificationError(
        'DOCUMENT_IN_USE',
        'Este documento já está em outra conta.'
      );
    }
    if (type === 'cnpj' && entry?.itemId && entry.itemId !== listing.id) {
      throw new ListingVerificationError(
        'CNPJ_ALREADY_USED',
        'Cada CNPJ vale para um estabelecimento. Filiais usam o CNPJ da filial.'
      );
    }

    // CPF já conferido nesta conta: os outros estabelecimentos com o mesmo CPF nascem conferidos (D12, P4).
    const reusesCheckedCpf = type === 'cpf' && Boolean(entry?.verifiedAt);
    const files = this.requiredFiles(type, input, reusesCheckedCpf);
    const nowIso = this.now().toISOString();
    return {
      itemId: listing.id,
      ownerId: listing.ownerId,
      mode: 'document',
      sourceItemId: null,
      documentType: type,
      document: await this.encryption.encrypt(normalized, {
        documentId: listing.id,
        field: 'document',
      }),
      documentIndex,
      maskedDocument: maskDocument(type, normalized),
      holderRole: reusesCheckedCpf ? 'owner' : (input.holderRole ?? null),
      files,
      cadastur: input.cadastur?.trim() || null,
      status: reusesCheckedCpf ? 'approved' : 'pending',
      rejectionReason: null,
      submittedAt: nowIso,
      reviewedAt: reusesCheckedCpf ? nowIso : null,
      reviewedBy: reusesCheckedCpf ? 'document-reuse' : null,
    };
  }

  private requiredFiles(
    type: ListingDocumentType,
    input: SubmitListingVerificationInput,
    reusesCheckedCpf: boolean
  ): ListingVerificationFiles {
    const files: ListingVerificationFiles = { ...EMPTY_FILES, ...input.files };
    if (reusesCheckedCpf) return files;
    if (!input.holderRole) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Informe se você é o titular ou um representante.'
      );
    }
    if (!files.identity) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Envie a foto do documento de identidade.'
      );
    }
    if (type === 'cnpj' && !files.cnpjCard) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Envie o Cartão CNPJ emitido pela Receita.'
      );
    }
    if (input.holderRole === 'representative' && !files.authorization) {
      throw new ListingVerificationError(
        'VALIDATION_ERROR',
        'Envie a autorização assinada por um sócio.'
      );
    }
    return files;
  }

  /** Perfil de produtor herda status e documento do estabelecimento de origem. */
  private async resolve(record: ListingVerificationRecord): Promise<ListingVerificationRecord> {
    if (record.mode !== 'linked' || !record.sourceItemId) return record;
    const source = await this.repository.get(record.sourceItemId);
    if (source?.mode !== 'document') return { ...record, status: 'pending' };
    return {
      ...record,
      status: source.status,
      documentType: source.documentType,
      documentIndex: source.documentIndex,
      maskedDocument: source.maskedDocument,
      rejectionReason: source.rejectionReason,
      reviewedAt: source.reviewedAt,
    };
  }
}

function filePaths(record: ListingVerificationRecord): string[] {
  return Object.values(record.files).filter((path): path is string => Boolean(path));
}
