import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  getStats: vi.fn(),
  getEvent: vi.fn(),
  assertPlan: vi.fn(),
}));

vi.mock('../../../domain/insights', () => ({ getItemStatsUseCase: m.getStats }));
vi.mock('../../../domain/events', () => ({ getEventListingByIdUseCase: m.getEvent }));
vi.mock('../../../domain/partners', async () => {
  const { ListingPlanError } = await import('../../../domain/partners/errors/listingPlanError');
  return { ListingPlanError, assertListingPlanActiveUseCase: m.assertPlan };
});

import { ListingPlanError } from '../../../domain/partners/errors/listingPlanError';
import { getListingStatsApplicationUseCase } from './getListingStatsApplicationUseCase';

const OWNER = { uid: 'p1' };
const STATS = { views: 3 };

describe('getListingStatsApplicationUseCase (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.getStats.mockResolvedValue(STATS);
    m.assertPlan.mockResolvedValue(undefined);
  });

  it('item com plano ativo devolve as métricas', async () => {
    await expect(getListingStatsApplicationUseCase(OWNER, 'item-1', 'items')).resolves.toBe(STATS);
    expect(m.assertPlan).toHaveBeenCalledWith('item-1');
  });

  it('item sem plano ativo é recusado com LISTING_PLAN_REQUIRED', async () => {
    m.assertPlan.mockRejectedValue(new ListingPlanError('LISTING_PLAN_REQUIRED', 'Sem plano.'));
    await expect(getListingStatsApplicationUseCase(OWNER, 'item-1', 'items')).rejects.toMatchObject(
      { code: 'LISTING_PLAN_REQUIRED', statusCode: 403 }
    );
  });

  it('evento usa o plano do estabelecimento a que pertence', async () => {
    m.getEvent.mockResolvedValue({ id: 'ev-1', establishmentId: 'item-9' });
    await getListingStatsApplicationUseCase(OWNER, 'ev-1', 'events');
    expect(m.assertPlan).toHaveBeenCalledWith('item-9');
  });

  it('evento sem estabelecimento não tem métricas', async () => {
    m.getEvent.mockResolvedValue({ id: 'ev-1' });
    await expect(getListingStatsApplicationUseCase(OWNER, 'ev-1', 'events')).rejects.toMatchObject({
      code: 'LISTING_PLAN_REQUIRED',
    });
    expect(m.assertPlan).not.toHaveBeenCalled();
  });

  it('posse é checada antes do plano', async () => {
    m.getStats.mockRejectedValue(new Error('FORBIDDEN'));
    await expect(getListingStatsApplicationUseCase(OWNER, 'item-1', 'items')).rejects.toThrow(
      'FORBIDDEN'
    );
    expect(m.assertPlan).not.toHaveBeenCalled();
  });

  it('admin vê as métricas sem plano', async () => {
    await getListingStatsApplicationUseCase({ uid: 'a1', admin: true }, 'item-1', 'items');
    expect(m.assertPlan).not.toHaveBeenCalled();
  });
});
