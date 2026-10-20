import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { CryptoUnavailableError } from '../../../shared/kernel/fieldEncryption';
import { ListingVerificationController } from './listingVerificationController';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  get: vi.fn(),
  readFile: vi.fn(),
  list: vi.fn(),
  review: vi.fn(),
}));

vi.mock(
  '../../../application/usecases/listingVerification/submitListingVerificationApplicationUseCase',
  () => ({
    submitListingVerificationApplicationUseCase: mocks.submit,
  })
);
vi.mock(
  '../../../application/usecases/listingVerification/getListingVerificationApplicationUseCase',
  () => ({
    getListingVerificationApplicationUseCase: mocks.get,
  })
);
vi.mock(
  '../../../application/usecases/listingVerification/readListingVerificationFileApplicationUseCase',
  () => ({
    readListingVerificationFileApplicationUseCase: mocks.readFile,
  })
);
vi.mock(
  '../../../application/usecases/listingVerification/listListingVerificationsApplicationUseCase',
  () => ({
    listListingVerificationsApplicationUseCase: mocks.list,
  })
);
vi.mock('../../../domain/partners', async () => {
  const { ListingVerificationError } = await import(
    '../../../domain/partners/errors/listingVerificationError'
  );
  return {
    ListingVerificationError,
    reviewListingVerificationUseCase: mocks.review,
  };
});

import { ListingVerificationError } from '../../../domain/partners/errors/listingVerificationError';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false, emailVerified: true, authTime: 1 };
const ADMIN = { ...OWNER, uid: 'admin-1', admin: true };
const VALID_BODY = {
  mode: 'document',
  documentType: 'cnpj',
  document: '11.222.333/0001-81',
  holderRole: 'owner',
  files: { cnpjCard: 'verification/owner-1/c.pdf', identity: 'verification/owner-1/i.webp' },
};

function req(partial: Partial<AuthenticatedRequest>) {
  return partial as AuthenticatedRequest;
}

describe('ListingVerificationController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('envio válido responde 200 com a visão mascarada', async () => {
    mocks.submit.mockResolvedValue({ status: 'pending', maskedDocument: '**.***.***/0001-81' });
    const res = response();
    await ListingVerificationController.submit(
      req({ user: OWNER, params: { itemId: 'item-1' }, body: VALID_BODY }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mocks.submit).toHaveBeenCalledWith(
      { uid: 'owner-1', admin: false },
      'item-1',
      expect.objectContaining({ documentType: 'cnpj' })
    );
  });

  it('campo extra no envio responde 400 VALIDATION_ERROR', async () => {
    const res = response();
    await ListingVerificationController.submit(
      req({
        user: OWNER,
        params: { itemId: 'item-1' },
        body: { ...VALID_BODY, status: 'approved' },
      }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('VALIDATION_ERROR');
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('sem login responde 401', async () => {
    const res = response();
    await ListingVerificationController.get(
      req({ params: { itemId: 'item-1' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('estabelecimento de outra pessoa responde 403 (IDOR)', async () => {
    mocks.get.mockRejectedValue(
      new ListingVerificationError('FORBIDDEN', 'Sem acesso a esta verificação.')
    );
    const res = response();
    await ListingVerificationController.get(
      req({ user: { ...OWNER, uid: 'intruso' }, params: { itemId: 'item-1' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('FORBIDDEN');
  });

  it('sem chave de criptografia responde 503 CRYPTO_UNAVAILABLE', async () => {
    mocks.submit.mockRejectedValue(new CryptoUnavailableError());
    const res = response();
    await ListingVerificationController.submit(
      req({ user: OWNER, params: { itemId: 'item-1' }, body: VALID_BODY }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('CRYPTO_UNAVAILABLE');
  });

  it('revisão do admin e conflito NOT_PENDING (409)', async () => {
    mocks.review.mockRejectedValueOnce(new ListingVerificationError('NOT_PENDING', 'Já revisada.'));
    const res = response();
    await ListingVerificationController.review(
      req({ user: ADMIN, params: { itemId: 'item-1' }, body: { decision: 'approve' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('arquivo sai sem cache e com nosniff', async () => {
    mocks.readFile.mockResolvedValue({
      data: Buffer.from('%PDF-'),
      contentType: 'application/pdf',
    });
    const res = response();
    await ListingVerificationController.readFile(
      req({ user: ADMIN, params: { itemId: 'item-1', kind: 'cnpjCard' } }),
      res as unknown as Response
    );
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store');
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('tipo de arquivo desconhecido responde 400', async () => {
    const res = response();
    await ListingVerificationController.readFile(
      req({ user: ADMIN, params: { itemId: 'item-1', kind: '../../etc' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mocks.readFile).not.toHaveBeenCalled();
  });
});
