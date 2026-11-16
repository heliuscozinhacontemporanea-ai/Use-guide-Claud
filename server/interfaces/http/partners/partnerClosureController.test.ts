import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ close: vi.fn() }));
vi.mock('../../../application/usecases/accountClosure/closePartnerApplicationUseCase', () => ({
  closePartnerApplicationUseCase: m.close,
}));

import { AccountClosureBlockedError } from '../../../application/usecases/accountClosure/accountClosureBlockedError';
import { PartnerClosureController } from './partnerClosureController';

function response() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(body: unknown) {
      res.body = body;
      return res;
    },
    end() {
      return res;
    },
  };
  return res;
}

const call = async (params: object, user: { uid: string; admin?: boolean } | null) => {
  const res = response();
  await PartnerClosureController.close(
    { params, user: user ?? undefined } as unknown as AuthenticatedRequest,
    res as unknown as Response
  );
  return res;
};

describe('PartnerClosureController (travas de 2026-11-16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('o próprio parceiro encerra o perfil: 204', async () => {
    m.close.mockResolvedValue(undefined);
    expect((await call({}, { uid: 'p1' })).statusCode).toBe(204);
    expect(m.close).toHaveBeenCalledWith('p1');
  });

  it('outro parceiro não encerra o perfil de ninguém: 403, nada é chamado', async () => {
    const res = await call({ partnerId: 'p2' }, { uid: 'p1' });
    expect(res.statusCode).toBe(403);
    expect(m.close).not.toHaveBeenCalled();
  });

  it('o admin encerra o de outra pessoa, também com as travas', async () => {
    m.close.mockRejectedValue(new AccountClosureBlockedError(['bookings']));
    const res = await call({ partnerId: 'p2' }, { uid: 'admin-1', admin: true });
    expect(m.close).toHaveBeenCalledWith('p2');
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: {
        code: 'ACCOUNT_HAS_ACTIVE_SALES',
        message: expect.any(String),
        blockers: ['bookings'],
      },
    });
  });

  it('sem login: 401; erro inesperado: 500 sem detalhe interno', async () => {
    expect((await call({}, null)).statusCode).toBe(401);
    m.close.mockRejectedValue(new Error('Firestore: segredo interno'));
    const res = await call({}, { uid: 'p1' });
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('segredo');
  });
});
