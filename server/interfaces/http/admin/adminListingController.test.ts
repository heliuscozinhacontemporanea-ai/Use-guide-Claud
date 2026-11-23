import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('../../../application/usecases/admin/getAdminListingApplicationUseCase', () => ({
  getAdminListingApplicationUseCase: m.get,
}));

import { AdminListingController } from './adminListingController';

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

const call = async (itemId: string) => {
  const res = response();
  await AdminListingController.get(
    {
      params: { itemId },
      user: { uid: 'admin-1', admin: true },
    } as unknown as AuthenticatedRequest,
    res as unknown as Response
  );
  return res;
};

describe('AdminListingController (F4)', () => {
  beforeEach(() => {
    m.get.mockReset();
  });

  it('devolve passos, publicação e dono do anúncio', async () => {
    const view = {
      publication: 'draft',
      setupSteps: [],
      publishSteps: [],
      owner: { kind: 'useguide' },
    };
    m.get.mockResolvedValue(view);
    const res = await call('item-1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: view });
  });

  it('id inválido: 400 VALIDATION_ERROR; inexistente: 404', async () => {
    expect((await call('../x')).body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
    m.get.mockResolvedValue(null);
    const res = await call('item-x');
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ error: { code: 'LISTING_NOT_FOUND' } });
  });

  it('falha inesperada: 503 sem detalhe interno', async () => {
    m.get.mockRejectedValue(new Error('segredo interno'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await call('item-1');
    expect(res.statusCode).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain('segredo');
  });
});
