import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';

const m = vi.hoisted(() => ({ getStats: vi.fn() }));

vi.mock('../../../application/usecases/insights/getListingStatsApplicationUseCase', () => ({
  getListingStatsApplicationUseCase: m.getStats,
}));
vi.mock('../../../domain/insights', async () => {
  const { InsightsAccessError } = await import('../../../domain/insights/errors/insightsErrors');
  return { InsightsAccessError };
});
vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return { ListingPlanError };
});

import { InsightsAccessError } from '../../../domain/insights/errors/insightsErrors';
import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { ListingStatsController } from './listingStatsController';

const USER = { uid: 'partner-1', admin: false, emailVerified: true, authTime: 1 };
const PARAMS = { itemCollection: 'items', itemId: 'item-1' };

function mockResponse() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

function request(partial: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return partial as AuthenticatedRequest;
}

async function call(partial: Partial<AuthenticatedRequest>) {
  const res = mockResponse();
  await ListingStatsController.get(request(partial), res as unknown as Response);
  return res;
}

describe('ListingStatsController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login responde 401', async () => {
    const res = await call({ params: PARAMS });
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('coleção inválida responde 400', async () => {
    const res = await call({ user: USER, params: { ...PARAMS, itemCollection: 'users' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(m.getStats).not.toHaveBeenCalled();
  });

  it('item de outro parceiro responde 403 FORBIDDEN', async () => {
    m.getStats.mockRejectedValue(new InsightsAccessError());
    const res = await call({ user: USER, params: PARAMS });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('FORBIDDEN');
  });

  it('estabelecimento sem plano responde 403 LISTING_PLAN_REQUIRED', async () => {
    m.getStats.mockRejectedValue(new ListingPlanError('LISTING_PLAN_REQUIRED', 'Sem plano.'));
    const res = await call({ user: USER, params: PARAMS });
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json.mock.calls[0]?.[0].error.code).toBe('LISTING_PLAN_REQUIRED');
  });

  it('com plano responde 200 com as métricas', async () => {
    m.getStats.mockResolvedValue({ views: 2 });
    const res = await call({ user: USER, params: PARAMS });
    expect(m.getStats).toHaveBeenCalledWith({ uid: 'partner-1', admin: false }, 'item-1', 'items');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: { views: 2 } });
  });
});
