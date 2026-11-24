import { describe, expect, it, vi } from 'vitest';
import type { BlindIndexPort, FieldEncryptionPort } from '../../../shared/kernel/fieldEncryption';
import type { ListingClaimRepositoryPort } from '../ports/listingClaimRepositoryPort';
import type { ListingVerificationRepositoryPort } from '../ports/listingVerificationRepositoryPort';
import type { ClaimableListing, ListingClaimRecord } from '../types/listingClaim';
import type {
  ListingVerificationRecord,
  VerificationDocumentEntry,
} from '../types/listingVerification';
import { ListingClaimService } from './listingClaimService';

const CNPJ = '11.222.333/0001-81';
const NOW = new Date('2026-11-24T12:00:00.000Z');

class FakeClaims implements ListingClaimRepositoryPort {
  records = new Map<string, ListingClaimRecord>();
  async get(claimId: string) {
    return this.records.get(claimId) ?? null;
  }
  async save(record: ListingClaimRecord) {
    this.records.set(record.claimId, record);
  }
  async saveReview(record: ListingClaimRecord) {
    this.records.set(record.claimId, record);
  }
  async listByStatus(status: ListingClaimRecord['status']) {
    return {
      data: [...this.records.values()].filter((r) => r.status === status),
      nextCursor: null,
    };
  }
  async listByItem(itemId: string) {
    return [...this.records.values()].filter((r) => r.itemId === itemId);
  }
  async listByClaimant(claimantId: string) {
    return [...this.records.values()].filter((r) => r.claimantId === claimantId);
  }
  async approve(claimId: string, reviewedAt: string, reviewedBy: string, reason: string) {
    const record = this.records.get(claimId);
    if (record?.status !== 'pending') throw new Error('NOT_PENDING');
    const rejected = (await this.listByItem(record.itemId))
      .filter((r) => r.claimId !== claimId && r.status === 'pending')
      .map((r) => ({ ...r, status: 'rejected' as const, rejectionReason: reason, reviewedAt }));
    for (const r of rejected) this.records.set(r.claimId, r);
    this.records.set(claimId, { ...record, status: 'approved', reviewedAt, reviewedBy });
    return rejected;
  }
  async deleteByClaimant(claimantId: string) {
    const removed = await this.listByClaimant(claimantId);
    for (const r of removed) this.records.delete(r.claimId);
    return removed;
  }
}

function fakeVerifications(entry: VerificationDocumentEntry | null = null) {
  const saved: ListingVerificationRecord[] = [];
  const port = {
    getDocumentEntry: vi.fn(async () => entry),
    saveSubmission: vi.fn(async (record: ListingVerificationRecord) => {
      saved.push(record);
    }),
    saveReview: vi.fn(async () => undefined),
    delete: vi.fn(async () => null),
  } as unknown as ListingVerificationRepositoryPort;
  return { port, saved };
}

const encryption: FieldEncryptionPort = {
  encrypt: async (plain, ctx) => ({
    v: 1,
    kid: 'test',
    iv: 'iv',
    tag: 'tag',
    ct: Buffer.from(`${ctx.documentId}:${plain}`).toString('base64url'),
  }),
  decrypt: async (field, ctx) => {
    const [id, plain] = Buffer.from(field.ct, 'base64url').toString().split(':');
    if (id !== ctx.documentId) throw new Error('AAD');
    return plain ?? '';
  },
};
const blindIndex: BlindIndexPort = { indexFor: (type, value) => `idx-${type}-${value.slice(-4)}` };

const useGuidePlace: ClaimableListing = {
  id: 'item-1',
  ownerId: 'useguide',
  category: 'restaurant',
  publication: 'published',
  isActive: true,
};
const claim = {
  documentType: 'cnpj' as const,
  document: CNPJ,
  holderRole: 'owner' as const,
  files: { cnpjCard: 'verification/ana/cartao.pdf', identity: 'verification/ana/rg.jpg' },
};
const admin = { uid: 'admin-1', admin: true };

function setup(entry: VerificationDocumentEntry | null = null) {
  const claims = new FakeClaims();
  const verifications = fakeVerifications(entry);
  const service = new ListingClaimService(
    claims,
    verifications.port,
    encryption,
    blindIndex,
    () => NOW
  );
  return { claims, verifications, service };
}

describe('"Sou o dono" (D35)', () => {
  it('só assume lugar do Use Guide publicado; anúncio de parceiro, dica ou rascunho, não', async () => {
    const { service } = setup();
    for (const listing of [
      { ...useGuidePlace, ownerId: 'partner-9' },
      { ...useGuidePlace, category: 'tips' },
      { ...useGuidePlace, publication: 'draft' },
      { ...useGuidePlace, isActive: false },
    ]) {
      await expect(service.submit('ana', listing, claim)).rejects.toMatchObject({
        code: 'LISTING_NOT_CLAIMABLE',
      });
    }
  });

  it('guarda o documento cifrado e devolve só a forma mascarada (classe Restrita, §7.6)', async () => {
    const { service, claims } = setup();
    const view = await service.submit('ana', useGuidePlace, claim);
    expect(JSON.stringify(view)).not.toContain('11222333000181');
    expect(view).toMatchObject({ status: 'pending', maskedDocument: expect.stringContaining('*') });
    const stored = claims.records.get('item-1_ana');
    expect(JSON.stringify(stored)).not.toContain('11222333000181');
    expect(stored?.document.ct).toBeTruthy();
  });

  it('pede os mesmos arquivos da verificação e recusa documento de outra conta', async () => {
    await expect(
      setup().service.submit('ana', useGuidePlace, { ...claim, files: { identity: 'x' } })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      setup().service.submit('ana', useGuidePlace, { ...claim, holderRole: 'representative' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const taken = setup({
      documentIndex: 'idx-cnpj-0181',
      ownerId: 'bruno',
      documentType: 'cnpj',
      itemId: null,
      verifiedAt: null,
    });
    await expect(taken.service.submit('ana', useGuidePlace, claim)).rejects.toMatchObject({
      code: 'DOCUMENT_IN_USE',
    });
  });

  it('só o admin decide; recusa exige motivo', async () => {
    const { service } = setup();
    const { claimId } = await service.submit('ana', useGuidePlace, claim);
    await expect(service.reject({ uid: 'ana' }, claimId, 'motivo qualquer')).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    await expect(service.reject(admin, claimId, 'ok')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    expect((await service.reject(admin, claimId, 'Documento ilegível')).status).toBe('rejected');
  });

  it('aprovar vale como verificação e recusa os outros pedidos do lugar (5b, 6a)', async () => {
    const { service, claims, verifications } = setup();
    const ana = await service.submit('ana', useGuidePlace, claim);
    await service.submit('bruno', useGuidePlace, {
      ...claim,
      document: '529.982.247-25',
      documentType: 'cpf',
    });
    const pending = await service.pending(admin, ana.claimId);
    const rejected = await service.completeApproval(admin, pending);

    expect(rejected.map((r) => r.claimantId)).toEqual(['bruno']);
    expect(claims.records.get(ana.claimId)?.status).toBe('approved');
    const verification = verifications.saved[0];
    expect(verification).toMatchObject({
      itemId: 'item-1',
      ownerId: 'ana',
      status: 'approved',
      reviewedBy: 'admin-1',
    });
    // Cifrado de novo para o anúncio: o valor do pedido não serve em outro registro (AAD, §7.7).
    expect(
      await encryption.decrypt(verification!.document!, {
        documentId: 'item-1',
        field: 'document',
      })
    ).toBe('11222333000181');
  });

  it('devolver ao Use Guide tira a verificação e marca o pedido', async () => {
    const { service, verifications } = setup();
    const ana = await service.submit('ana', useGuidePlace, claim);
    await expect(service.approved(admin, ana.claimId)).rejects.toMatchObject({
      code: 'NOT_APPROVED',
    });
    await service.completeApproval(admin, await service.pending(admin, ana.claimId));
    const returned = await service.completeReturn(
      admin,
      await service.approved(admin, ana.claimId)
    );
    expect(returned.status).toBe('returned');
    expect(verifications.port.delete).toHaveBeenCalledWith('item-1');
  });

  it('exclusão da conta apaga os pedidos e devolve os arquivos (LGPD)', async () => {
    const { service, claims } = setup();
    await service.submit('ana', useGuidePlace, claim);
    expect(await service.deleteForClaimant('ana')).toEqual([
      'verification/ana/cartao.pdf',
      'verification/ana/rg.jpg',
    ]);
    expect(claims.records.size).toBe(0);
  });
});
