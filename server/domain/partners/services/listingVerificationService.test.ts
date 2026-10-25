import { beforeEach, describe, expect, it } from 'vitest';
import type { BlindIndexPort, FieldEncryptionPort } from '../../../shared/kernel/fieldEncryption';
import type { ListingVerificationRepositoryPort } from '../ports/listingVerificationRepositoryPort';
import type {
  ListingVerificationRecord,
  VerificationDocumentEntry,
  VerificationListing,
} from '../types/listingVerification';
import { ListingVerificationService } from './listingVerificationService';

const CNPJ = '11.222.333/0001-81';
const CNPJ_2 = '11.444.777/0001-61';
const CPF = '529.982.247-25';

class InMemoryRepository implements ListingVerificationRepositoryPort {
  records = new Map<string, ListingVerificationRecord>();
  entries = new Map<string, VerificationDocumentEntry>();

  async get(itemId: string) {
    return this.records.get(itemId) ?? null;
  }
  async getDocumentEntry(index: string) {
    return this.entries.get(index) ?? null;
  }
  async saveSubmission(record: ListingVerificationRecord) {
    const previous = this.records.get(record.itemId);
    if (previous?.documentType === 'cnpj' && previous.documentIndex !== record.documentIndex) {
      this.entries.delete(previous.documentIndex as string);
    }
    this.records.set(record.itemId, record);
    if (record.documentIndex && record.documentType) {
      const entry = this.entries.get(record.documentIndex);
      this.entries.set(record.documentIndex, {
        documentIndex: record.documentIndex,
        ownerId: record.ownerId,
        documentType: record.documentType,
        itemId: record.documentType === 'cnpj' ? record.itemId : null,
        verifiedAt: entry?.verifiedAt ?? null,
      });
    }
  }
  async saveReview(record: ListingVerificationRecord) {
    this.records.set(record.itemId, record);
    if (record.status === 'approved' && record.documentIndex) {
      const entry = this.entries.get(record.documentIndex);
      if (entry) entry.verifiedAt = record.reviewedAt;
    }
  }
  async listByStatus(status: string) {
    return {
      data: [...this.records.values()].filter((r) => r.status === status),
      nextCursor: null,
    };
  }
  async listLinkedItemIds(sourceItemId: string) {
    return [...this.records.values()]
      .filter((r) => r.sourceItemId === sourceItemId)
      .map((r) => r.itemId);
  }
  async listByOwner(ownerId: string) {
    return [...this.records.values()].filter((r) => r.ownerId === ownerId);
  }
  async delete(itemId: string) {
    const record = this.records.get(itemId) ?? null;
    this.records.delete(itemId);
    return record;
  }
  async deleteByOwner(ownerId: string) {
    const removed = [...this.records.values()].filter((r) => r.ownerId === ownerId);
    for (const r of removed) this.records.delete(r.itemId);
    return removed;
  }
}

const encryption: FieldEncryptionPort = {
  encrypt: async (plain, ctx) => ({
    v: 1,
    kid: 'test',
    iv: 'iv',
    tag: 'tag',
    ct: Buffer.from(`${ctx.documentId}:${plain}`).toString('base64url'),
  }),
  decrypt: async () => '',
};
const blindIndex: BlindIndexPort = {
  indexFor: (purpose, value) => `idx-${purpose}-${value.slice(-4)}`,
};

const owner = { uid: 'owner-1' };
const admin = { uid: 'admin-1', admin: true };
const pousada: VerificationListing = { id: 'item-1', ownerId: 'owner-1', category: 'hotel' };
const restaurante: VerificationListing = {
  id: 'item-2',
  ownerId: 'owner-1',
  category: 'restaurant',
};
const produtor: VerificationListing = { id: 'item-3', ownerId: 'owner-1', category: 'producer' };
const cnpjFiles = {
  cnpjCard: 'verification/owner-1/c.pdf',
  identity: 'verification/owner-1/i.webp',
};

describe('ListingVerificationService (D12)', () => {
  let repository: InMemoryRepository;
  let service: ListingVerificationService;

  beforeEach(() => {
    repository = new InMemoryRepository();
    service = new ListingVerificationService(
      repository,
      encryption,
      blindIndex,
      () => new Date('2026-10-19T12:00:00Z')
    );
  });

  async function submitCnpj(listing = pousada, document = CNPJ) {
    return service.submit(
      { uid: listing.ownerId },
      listing,
      { mode: 'document', documentType: 'cnpj', document, holderRole: 'owner', files: cnpjFiles },
      null
    );
  }

  it('CNPJ vai para a fila com número cifrado e só a forma mascarada na resposta', async () => {
    const view = await submitCnpj();
    expect(view.status).toBe('pending');
    expect(view.maskedDocument).toBe('**.***.***/0001-81');
    expect(JSON.stringify(view)).not.toContain('11222333000181');
    const stored = repository.records.get('item-1');
    expect(JSON.stringify(stored)).not.toContain('11222333000181');
    expect(stored?.document?.ct).toBeTruthy();
  });

  it('exige Cartão CNPJ, identidade e autorização do representante', async () => {
    await expect(
      service.submit(
        owner,
        pousada,
        {
          mode: 'document',
          documentType: 'cnpj',
          document: CNPJ,
          holderRole: 'owner',
          files: { identity: 'x' },
        },
        null
      )
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.submit(
        owner,
        pousada,
        {
          mode: 'document',
          documentType: 'cnpj',
          document: CNPJ,
          holderRole: 'representative',
          files: cnpjFiles,
        },
        null
      )
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('recusa documento inválido', async () => {
    await expect(submitCnpj(pousada, '11.222.333/0001-00')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });

  it('um CNPJ vale para um estabelecimento só', async () => {
    await submitCnpj(pousada);
    await expect(submitCnpj(restaurante)).rejects.toMatchObject({ code: 'CNPJ_ALREADY_USED' });
  });

  it('documento de outra conta é recusado', async () => {
    await submitCnpj(pousada);
    const alheio: VerificationListing = { id: 'item-9', ownerId: 'owner-2', category: 'hotel' };
    await expect(submitCnpj(alheio)).rejects.toMatchObject({ code: 'DOCUMENT_IN_USE' });
  });

  it('só o dono envia a verificação do estabelecimento', async () => {
    await expect(
      service.submit(
        { uid: 'intruso' },
        pousada,
        {
          mode: 'document',
          documentType: 'cnpj',
          document: CNPJ,
          holderRole: 'owner',
          files: cnpjFiles,
        },
        null
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('CPF conferido uma vez vale para os outros estabelecimentos da conta', async () => {
    const cpfInput = {
      mode: 'document' as const,
      documentType: 'cpf' as const,
      document: CPF,
      holderRole: 'owner' as const,
      files: { identity: 'verification/owner-1/i.webp' },
    };
    await service.submit(owner, pousada, cpfInput, null);
    await service.review(admin, 'item-1', 'approve', null);
    const second = await service.submit(
      owner,
      restaurante,
      { mode: 'document', documentType: 'cpf', document: CPF },
      null
    );
    expect(second.status).toBe('approved');
  });

  it('perfil de produtor usa o documento de um estabelecimento e herda o status', async () => {
    await submitCnpj(pousada);
    const linked = await service.submit(
      owner,
      produtor,
      { mode: 'linked', sourceItemId: 'item-1' },
      pousada
    );
    expect(linked.status).toBe('pending');
    await service.review(admin, 'item-1', 'approve', null);
    expect(await service.getStatus('item-3')).toBe('approved');
    await expect(
      service.submit(
        owner,
        produtor,
        { mode: 'linked', sourceItemId: 'item-9' },
        { id: 'item-9', ownerId: 'owner-2', category: 'hotel' }
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('só admin revisa; recusa exige motivo; não revisa duas vezes', async () => {
    await submitCnpj();
    await expect(service.review(owner, 'item-1', 'approve', null)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.review(admin, 'item-1', 'reject', ' ')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const rejected = await service.review(admin, 'item-1', 'reject', 'Cartão CNPJ ilegível');
    expect(rejected.rejectionReason).toBe('Cartão CNPJ ilegível');
    await expect(service.review(admin, 'item-1', 'approve', null)).rejects.toMatchObject({
      code: 'NOT_PENDING',
    });
  });

  describe('venda (assertCanSell)', () => {
    it('bloqueia sem verificação aprovada', async () => {
      await expect(service.assertCanSell('item-1')).rejects.toMatchObject({
        code: 'LISTING_NOT_VERIFIED',
      });
      await submitCnpj();
      await expect(service.assertCanSell('item-1')).rejects.toMatchObject({
        code: 'LISTING_NOT_VERIFIED',
      });
    });

    it('libera CNPJ aprovado', async () => {
      await submitCnpj();
      await service.review(admin, 'item-1', 'approve', null);
      const sale = await service.assertCanSell('item-1');
      expect(sale.accountKey).toEqual(expect.any(String));
    });

    it('CPF não vende', async () => {
      await service.submit(
        owner,
        pousada,
        {
          mode: 'document',
          documentType: 'cpf',
          document: CPF,
          holderRole: 'owner',
          files: { identity: 'x' },
        },
        null
      );
      await service.review(admin, 'item-1', 'approve', null);
      await expect(service.assertCanSell('item-1')).rejects.toMatchObject({
        code: 'CPF_CANNOT_SELL',
      });
    });

    it('cada CNPJ aprovado vende pela própria conta (D14)', async () => {
      await submitCnpj(pousada, CNPJ);
      await service.review(admin, 'item-1', 'approve', null);
      await submitCnpj(restaurante, CNPJ_2);
      await service.review(admin, 'item-2', 'approve', null);
      const first = await service.assertCanSell('item-1');
      const second = await service.assertCanSell('item-2');
      expect(first.accountKey).not.toBe(second.accountKey);
    });
  });

  describe('documentos de vendas (D14)', () => {
    it('lista só CNPJs aprovados, com o perfil de produtor junto do estabelecimento de origem', async () => {
      await submitCnpj(pousada, CNPJ);
      await service.review(admin, 'item-1', 'approve', null);
      await submitCnpj(restaurante, CNPJ_2);
      await service.submit(owner, produtor, { mode: 'linked', sourceItemId: 'item-1' }, pousada);
      const documents = await service.listSalesDocuments('owner-1');
      expect(documents).toHaveLength(1);
      expect(documents[0]?.itemIds.sort()).toEqual(['item-1', 'item-3']);
      expect(documents[0]?.maskedDocument).not.toContain(CNPJ.slice(0, 8));
      expect(await service.listSalesDocuments('owner-2')).toEqual([]);
    });

    it('devolve o CNPJ só para o dono do documento aprovado', async () => {
      await submitCnpj(pousada, CNPJ);
      await service.review(admin, 'item-1', 'approve', null);
      const [document] = await service.listSalesDocuments('owner-1');
      const accountKey = document?.accountKey ?? '';
      await expect(service.getSalesDocument('owner-1', accountKey)).resolves.toEqual(
        expect.any(String)
      );
      await expect(service.getSalesDocument('owner-2', accountKey)).rejects.toMatchObject({
        code: 'NOT_FOUND',
      });
    });
  });

  it('excluir o estabelecimento devolve os arquivos para apagar', async () => {
    await submitCnpj();
    expect(await service.deleteForListing('item-1')).toEqual([
      cnpjFiles.cnpjCard,
      cnpjFiles.identity,
    ]);
  });
});
