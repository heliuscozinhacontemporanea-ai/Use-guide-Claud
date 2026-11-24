import type { BlindIndexPort, FieldEncryptionPort } from '../../../shared/kernel/fieldEncryption';
import { isUseGuideOwner } from '../../../shared/kernel/useGuideOwner';
import { ListingClaimError } from '../errors/listingClaimError';
import type { ListingClaimRepositoryPort } from '../ports/listingClaimRepositoryPort';
import type { ListingVerificationRepositoryPort } from '../ports/listingVerificationRepositoryPort';
import type {
  ClaimableListing,
  ListingClaimRecord,
  ListingClaimStatus,
  ListingClaimView,
  SubmitListingClaimInput,
} from '../types/listingClaim';
import type {
  ListingVerificationFiles,
  ListingVerificationRecord,
} from '../types/listingVerification';
import { maskDocument } from '../utils/maskDocument';
import { isValidCNPJ, isValidCPF, normalizeDocument } from './documentIdentity';

// Lugares que o Use Guide cadastra e que um dono pode assumir (D35): dica e perfil de produtor não.
const CLAIMABLE_CATEGORIES = new Set([
  'sight',
  'hotel',
  'restaurant',
  'tour',
  'transfer',
  'rental',
]);
const MIN_REJECTION_REASON = 5;
const SIBLING_REASON = 'Outro pedido para este lugar foi aprovado.';

interface Actor {
  uid: string;
  admin?: boolean;
}

export function listingClaimId(itemId: string, claimantId: string): string {
  return `${itemId}_${claimantId}`;
}

export function toListingClaimView(record: ListingClaimRecord): ListingClaimView {
  return {
    claimId: record.claimId,
    itemId: record.itemId,
    claimantId: record.claimantId,
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

/**
 * "Sou o dono" (D35): o dono de um lugar cadastrado pelo Use Guide pede o anúncio com os documentos da
 * verificação (D12, 4a); o admin aprova um pedido, e os outros para o mesmo lugar são recusados (5b).
 */
export class ListingClaimService {
  constructor(
    private readonly repository: ListingClaimRepositoryPort,
    private readonly verifications: ListingVerificationRepositoryPort,
    private readonly encryption: FieldEncryptionPort,
    private readonly blindIndex: BlindIndexPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async submit(
    claimantId: string,
    listing: ClaimableListing,
    input: SubmitListingClaimInput
  ): Promise<ListingClaimView> {
    if (!isClaimable(listing)) {
      throw new ListingClaimError(
        'LISTING_NOT_CLAIMABLE',
        'Este anúncio não pode ser assumido pelo app.'
      );
    }
    const type = input.documentType;
    const normalized = normalizeDocument(input.document);
    if (!(type === 'cpf' ? isValidCPF(normalized) : isValidCNPJ(normalized))) {
      throw new ListingClaimError('VALIDATION_ERROR', `${type.toUpperCase()} inválido.`);
    }
    const claimId = listingClaimId(listing.id, claimantId);
    const documentIndex = this.blindIndex.indexFor(type, normalized);
    const [existing, entry] = await Promise.all([
      this.repository.get(claimId),
      this.verifications.getDocumentEntry(documentIndex),
    ]);
    if (existing?.status === 'approved') {
      throw new ListingClaimError('ALREADY_APPROVED', 'Este anúncio já é seu.');
    }
    if (entry && entry.ownerId !== claimantId) {
      throw new ListingClaimError('DOCUMENT_IN_USE', 'Este documento já está em outra conta.');
    }
    if (type === 'cnpj' && entry?.itemId && entry.itemId !== listing.id) {
      throw new ListingClaimError(
        'CNPJ_ALREADY_USED',
        'Cada CNPJ vale para um estabelecimento. Filiais usam o CNPJ da filial.'
      );
    }
    const record: ListingClaimRecord = {
      claimId,
      itemId: listing.id,
      claimantId,
      documentType: type,
      document: await this.encryption.encrypt(normalized, {
        documentId: claimId,
        field: 'document',
      }),
      documentIndex,
      maskedDocument: maskDocument(type, normalized),
      holderRole: input.holderRole,
      files: requiredFiles(input),
      cadastur: input.cadastur?.trim() || null,
      status: 'pending',
      rejectionReason: null,
      submittedAt: this.now().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
    };
    await this.repository.save(record);
    return toListingClaimView(record);
  }

  async reject(actor: Actor, claimId: string, reason: string | null): Promise<ListingClaimRecord> {
    const record = await this.pending(actor, claimId);
    const trimmed = reason?.trim() ?? '';
    if (trimmed.length < MIN_REJECTION_REASON) {
      throw new ListingClaimError('VALIDATION_ERROR', 'Informe o motivo da recusa.');
    }
    const rejected: ListingClaimRecord = {
      ...record,
      status: 'rejected',
      rejectionReason: trimmed,
      reviewedAt: this.now().toISOString(),
      reviewedBy: actor.uid,
    };
    await this.repository.saveReview(rejected);
    return rejected;
  }

  /** Pedido em análise que o admin vai aprovar; o anúncio passa de dono antes de `completeApproval`. */
  async pending(actor: Actor, claimId: string): Promise<ListingClaimRecord> {
    ensureAdmin(actor);
    const record = await this.repository.get(claimId);
    if (!record) throw new ListingClaimError('NOT_FOUND', 'Pedido não encontrado.');
    if (record.status !== 'pending') {
      throw new ListingClaimError('NOT_PENDING', 'Este pedido já foi revisado.');
    }
    return record;
  }

  /**
   * Aprovação vale como verificação (6a): grava a verificação do estabelecimento já aprovada, com o
   * mesmo documento (cifrado de novo para o anúncio), e só então marca o pedido. Devolve os pedidos
   * recusados junto, para avisar quem pediu.
   */
  async completeApproval(actor: Actor, claim: ListingClaimRecord): Promise<ListingClaimRecord[]> {
    ensureAdmin(actor);
    const reviewedAt = this.now().toISOString();
    const document = await this.encryption.decrypt(claim.document, {
      documentId: claim.claimId,
      field: 'document',
    });
    const verification: ListingVerificationRecord = {
      itemId: claim.itemId,
      ownerId: claim.claimantId,
      mode: 'document',
      sourceItemId: null,
      documentType: claim.documentType,
      document: await this.encryption.encrypt(document, {
        documentId: claim.itemId,
        field: 'document',
      }),
      documentIndex: claim.documentIndex,
      maskedDocument: claim.maskedDocument,
      holderRole: claim.holderRole,
      files: { ...claim.files },
      cadastur: claim.cadastur,
      status: 'approved',
      rejectionReason: null,
      submittedAt: claim.submittedAt,
      reviewedAt,
      reviewedBy: actor.uid,
    };
    await this.verifications.saveSubmission(verification);
    await this.verifications.saveReview(verification);
    return this.repository.approve(claim.claimId, reviewedAt, actor.uid, SIBLING_REASON);
  }

  /** Pedido aprovado que o admin devolve ao Use Guide (6a); o anúncio volta de dono antes. */
  async approved(actor: Actor, claimId: string): Promise<ListingClaimRecord> {
    ensureAdmin(actor);
    const record = await this.repository.get(claimId);
    if (!record) throw new ListingClaimError('NOT_FOUND', 'Pedido não encontrado.');
    if (record.status !== 'approved') {
      throw new ListingClaimError('NOT_APPROVED', 'Só um pedido aprovado pode ser devolvido.');
    }
    return record;
  }

  /** Tira a verificação do anúncio (o CNPJ fica livre) e marca o pedido como devolvido. */
  async completeReturn(actor: Actor, claim: ListingClaimRecord): Promise<ListingClaimRecord> {
    ensureAdmin(actor);
    // Os arquivos continuam com o pedido, que guarda o histórico; saem quando a conta é excluída.
    await this.verifications.delete(claim.itemId);
    const returned: ListingClaimRecord = {
      ...claim,
      status: 'returned',
      reviewedAt: this.now().toISOString(),
      reviewedBy: actor.uid,
    };
    await this.repository.saveReview(returned);
    return returned;
  }

  async listForReview(
    actor: Actor,
    status: ListingClaimStatus,
    limit: number,
    cursor: string | null
  ): Promise<{ data: ListingClaimRecord[]; nextCursor: string | null }> {
    ensureAdmin(actor);
    return this.repository.listByStatus(status, limit, cursor);
  }

  listForItem(actor: Actor, itemId: string): Promise<ListingClaimRecord[]> {
    ensureAdmin(actor);
    return this.repository.listByItem(itemId);
  }

  async listMine(claimantId: string): Promise<ListingClaimView[]> {
    return (await this.repository.listByClaimant(claimantId)).map(toListingClaimView);
  }

  async getFilePath(
    actor: Actor,
    claimId: string,
    kind: keyof ListingVerificationFiles
  ): Promise<string | null> {
    ensureAdmin(actor);
    return (await this.repository.get(claimId))?.files[kind] ?? null;
  }

  async deleteForClaimant(claimantId: string): Promise<string[]> {
    const removed = await this.repository.deleteByClaimant(claimantId);
    return removed.flatMap((record) =>
      Object.values(record.files).filter((path): path is string => Boolean(path))
    );
  }
}

function isClaimable(listing: ClaimableListing): boolean {
  return (
    isUseGuideOwner(listing.ownerId) &&
    CLAIMABLE_CATEGORIES.has(listing.category) &&
    listing.publication === 'published' &&
    listing.isActive
  );
}

function ensureAdmin(actor: Actor): void {
  if (!actor.admin) {
    throw new ListingClaimError('FORBIDDEN', 'Somente administradores revisam os pedidos.');
  }
}

function requiredFiles(input: SubmitListingClaimInput): ListingVerificationFiles {
  const files: ListingVerificationFiles = {
    cnpjCard: input.files.cnpjCard ?? null,
    identity: input.files.identity ?? null,
    authorization: input.files.authorization ?? null,
  };
  if (!files.identity) {
    throw new ListingClaimError('VALIDATION_ERROR', 'Envie a foto do documento de identidade.');
  }
  if (input.documentType === 'cnpj' && !files.cnpjCard) {
    throw new ListingClaimError('VALIDATION_ERROR', 'Envie o Cartão CNPJ emitido pela Receita.');
  }
  if (input.holderRole === 'representative' && !files.authorization) {
    throw new ListingClaimError('VALIDATION_ERROR', 'Envie a autorização assinada por um sócio.');
  }
  return files;
}
