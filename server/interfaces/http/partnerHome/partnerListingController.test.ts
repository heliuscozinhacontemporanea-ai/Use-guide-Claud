import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ publish: vi.fn(), resolve: vi.fn() }));

vi.mock('../../../application/usecases/resolveGuideUserContextApplicationUseCase', () => ({
  resolveGuideUserContextApplicationUseCase: m.resolve,
}));
vi.mock('../../../domain/guide', async () => {
  const { GuideDomainError } = await import('../../../domain/guide/errors/guideDomainError');
  return { GuideDomainError, publishGuideItemUseCase: m.publish };
});

import { GuideDomainError } from '../../../domain/guide/errors/guideDomainError';
import { PartnerListingController } from './partnerListingController';

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

const request = (params: object, uid: string | null = 'partner-1') =>
  ({ params, user: uid ? { uid } : undefined }) as unknown as AuthenticatedRequest;

const call = async (req: AuthenticatedRequest) => {
  const res = response();
  await PartnerListingController.publish(req, res as unknown as Response);
  return res;
};

describe('PartnerListingController.publish', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.resolve.mockResolvedValue({ uid: 'partner-1', role: 'partner', admin: false });
  });

  it('publica e responde 204 sem corpo', async () => {
    const res = await call(request({ itemId: 'item-1' }));
    expect(res.statusCode).toBe(204);
    expect(m.publish).toHaveBeenCalledWith(
      { uid: 'partner-1', role: 'partner', admin: false },
      'item-1'
    );
  });

  it('sem login: 401', async () => {
    const res = await call(request({ itemId: 'item-1' }, null));
    expect(res.statusCode).toBe(401);
    expect(m.publish).not.toHaveBeenCalled();
  });

  it('ID inválido: 400 VALIDATION_ERROR', async () => {
    const res = await call(request({ itemId: '../items/x' }));
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: { code: 'VALIDATION_ERROR', message: 'Anúncio inválido.' } });
  });

  it('passos faltando: 422 LISTING_INCOMPLETE com os passos', async () => {
    m.publish.mockRejectedValue(
      new GuideDomainError('LISTING_INCOMPLETE', 'Complete os passos do guia antes de publicar.', {
        steps: [{ id: 'photos', missing: ['images'] }],
      })
    );
    const res = await call(request({ itemId: 'item-1' }));
    expect(res.statusCode).toBe(422);
    expect(res.body).toEqual({
      error: {
        code: 'LISTING_INCOMPLETE',
        message: 'Complete os passos do guia antes de publicar.',
        steps: [{ id: 'photos', missing: ['images'] }],
      },
    });
  });

  it('IDOR: anúncio de outra pessoa responde 404, sem dizer que existe', async () => {
    m.publish.mockRejectedValue(new GuideDomainError('FORBIDDEN', 'Sem permissão'));
    const res = await call(request({ itemId: 'item-2' }));
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'LISTING_NOT_FOUND', message: 'Anúncio não encontrado.' },
    });
  });

  it('erro inesperado: 500 sem detalhe interno', async () => {
    m.publish.mockRejectedValue(new Error('firestore: deadline exceeded at /items/item-1'));
    const res = await call(request({ itemId: 'item-1' }));
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('firestore');
  });
});
