import type { NextFunction, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveGuideUserContextApplicationUseCase } from '../../../application/usecases/resolveGuideUserContextApplicationUseCase';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { resolveGuideContext } from './guideContextMiddleware';

vi.mock('../../../application/usecases/resolveGuideUserContextApplicationUseCase', () => ({
  resolveGuideUserContextApplicationUseCase: vi.fn(),
}));

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
  };
  return res;
}

describe('resolveGuideContext (papel lido no servidor)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login responde 401 no formato de erro', async () => {
    const res = response();
    const next = vi.fn() as NextFunction;
    await resolveGuideContext({} as AuthenticatedRequest, res as unknown as Response, next);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ error: { code: 'UNAUTHENTICATED', message: expect.any(String) } });
    expect(next).not.toHaveBeenCalled();
  });

  it('põe o contexto na requisição e segue', async () => {
    const context = { uid: 'ana', admin: false, role: 'partner' as const };
    vi.mocked(resolveGuideUserContextApplicationUseCase).mockResolvedValueOnce(context);
    const req = { user: { uid: 'ana' } } as AuthenticatedRequest;
    const next = vi.fn() as NextFunction;
    await resolveGuideContext(req, response() as unknown as Response, next);
    expect(req.guideUserContext).toEqual(context);
    expect(next).toHaveBeenCalledOnce();
  });

  it('falha ao ler a conta: 500 sem detalhe interno', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(resolveGuideUserContextApplicationUseCase).mockRejectedValueOnce(
      new Error('Firestore indisponível')
    );
    const res = response();
    await resolveGuideContext(
      { user: { uid: 'ana' } } as AuthenticatedRequest,
      res as unknown as Response,
      vi.fn() as NextFunction
    );
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('Firestore');
  });
});
