import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ list: vi.fn(), session: vi.fn() }));

vi.mock(
  '../../../application/usecases/paymentAccounts/listPartnerPaymentAccountsApplicationUseCase',
  () => ({ listPartnerPaymentAccountsApplicationUseCase: m.list })
);
vi.mock(
  '../../../application/usecases/paymentAccounts/startPaymentAccountSessionApplicationUseCase',
  () => ({ startPaymentAccountSessionApplicationUseCase: m.session })
);

import { ListingVerificationError } from '../../../domain/partners/errors/listingVerificationError';
import { PaymentAccountController } from './paymentAccountController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false, email: 'dono@pousada.test' };
const ADMIN = { uid: 'admin-1', admin: true, email: 'admin@useguide.test' };
const KEY = 'a'.repeat(43);

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { query: {}, body: {}, user: OWNER, ...overrides } as never;
}

describe('PaymentAccountController (D14)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login: 401', async () => {
    const res = response();
    await PaymentAccountController.list(request({ user: undefined }), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('parceiro só vê as próprias contas, mesmo pedindo as de outro', async () => {
    m.list.mockResolvedValue([]);
    const res = response();
    await PaymentAccountController.list(
      request({ query: { ownerUid: 'owner-2' } as never }),
      res as unknown as Response
    );
    expect(m.list).toHaveBeenCalledWith('owner-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('admin consulta as contas de um parceiro', async () => {
    m.list.mockResolvedValue([]);
    const res = response();
    await PaymentAccountController.list(
      request({ user: ADMIN as never, query: { ownerUid: 'owner-2' } as never }),
      res as unknown as Response
    );
    expect(m.list).toHaveBeenCalledWith('owner-2');
  });

  it('accountKey inválida ou campo extra: 400 sem criar conta', async () => {
    for (const body of [{ accountKey: '../x' }, { accountKey: KEY, ownerUid: 'owner-2' }]) {
      const res = response();
      await PaymentAccountController.createSession(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(m.session).not.toHaveBeenCalled();
  });

  it('sessão sempre em nome de quem está logado', async () => {
    m.session.mockResolvedValue({ clientSecret: 'cs' });
    const res = response();
    await PaymentAccountController.createSession(
      request({ body: { accountKey: KEY } }),
      res as unknown as Response
    );
    expect(m.session).toHaveBeenCalledWith({ uid: 'owner-1', email: 'dono@pousada.test' }, KEY);
    expect(res.json).toHaveBeenCalledWith({ data: { clientSecret: 'cs' } });
  });

  it('CNPJ de outro parceiro (IDOR): 404 com código estável', async () => {
    m.session.mockRejectedValue(
      new ListingVerificationError('NOT_FOUND', 'Documento de vendas não encontrado.')
    );
    const res = response();
    await PaymentAccountController.createSession(
      request({ body: { accountKey: KEY } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Documento de vendas não encontrado.' },
    });
  });

  it('erro inesperado: 503 sem detalhe interno', async () => {
    m.list.mockRejectedValue(new Error('StripeConnectionError: chave sk_test_xxx'));
    const res = response();
    await PaymentAccountController.list(request({}), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('sk_test');
  });
});
