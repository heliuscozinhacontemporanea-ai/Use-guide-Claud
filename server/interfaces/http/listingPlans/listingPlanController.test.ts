import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ get: vi.fn(), trial: vi.fn(), seal: vi.fn() }));

vi.mock('../../../application/usecases/listingPlans/getListingPlanApplicationUseCase', () => ({
  getListingPlanApplicationUseCase: m.get,
}));
vi.mock(
  '../../../application/usecases/listingPlans/activateListingTrialApplicationUseCase',
  () => ({ activateListingTrialApplicationUseCase: m.trial })
);
vi.mock(
  '../../../application/usecases/listingPlans/setListingSealByAdminApplicationUseCase',
  () => ({ setListingSealByAdminApplicationUseCase: m.seal })
);

import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import { ListingPlanController } from './listingPlanController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false, emailVerified: true, authTime: 1 };

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { params: { itemId: 'item-1' }, body: {}, user: OWNER, ...overrides } as never;
}

describe('ListingPlanController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login: 401', async () => {
    const res = response();
    await ListingPlanController.get(request({ user: undefined }), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('itemId inválido: 400 sem chamar o caso de uso', async () => {
    const res = response();
    await ListingPlanController.activateTrial(
      request({ params: { itemId: '../x' } as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.trial).not.toHaveBeenCalled();
  });

  it('trial antes da verificação: 422 com o código estável', async () => {
    m.trial.mockRejectedValue(
      new ListingPlanError('LISTING_PENDING_VERIFICATION', 'Verifique antes.')
    );
    const res = response();
    await ListingPlanController.activateTrial(request({}), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'LISTING_PENDING_VERIFICATION', message: 'Verifique antes.' },
    });
  });

  it('selo do admin recusa campo extra no corpo', async () => {
    const res = response();
    await ListingPlanController.setSeal(
      request({ body: { grant: true, planType: 'annual' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.seal).not.toHaveBeenCalled();
  });

  it('erro inesperado: 500 sem detalhe interno', async () => {
    m.get.mockRejectedValue(new Error('firestore caiu'));
    const res = response();
    await ListingPlanController.get(request({}), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('firestore caiu');
  });
});
