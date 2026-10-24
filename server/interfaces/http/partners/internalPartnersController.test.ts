import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  runListingPlanMaintenanceApplicationUseCase: vi.fn(),
  refreshFeaturedListingsApplicationUseCase: vi.fn(),
}));

vi.mock(
  '../../../application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase',
  () => ({
    runListingPlanMaintenanceApplicationUseCase: mocks.runListingPlanMaintenanceApplicationUseCase,
  })
);

vi.mock('../../../application/usecases/featured/refreshFeaturedListingsApplicationUseCase', () => ({
  refreshFeaturedListingsApplicationUseCase: mocks.refreshFeaturedListingsApplicationUseCase,
}));

import { InternalPartnersController } from './internalPartnersController';

describe('InternalPartnersController.checkExpiringPlans', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    req = {};
    res = {
      status: statusMock as unknown as Response['status'],
    };
  });

  it('retorna 200 com os selos vencidos, os avisos e o rodízio do destaque', async () => {
    mocks.runListingPlanMaintenanceApplicationUseCase.mockResolvedValue({
      expired: 1,
      notified: 3,
    });
    mocks.refreshFeaturedListingsApplicationUseCase.mockResolvedValue({
      day: '2026-10-22',
      featured: 9,
    });

    await InternalPartnersController.checkExpiringPlans(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      expired: 1,
      notified: 3,
      featured: { day: '2026-10-22', featured: 9 },
    });
    expect(
      mocks.refreshFeaturedListingsApplicationUseCase.mock.invocationCallOrder[0] ?? -1
    ).toBeGreaterThan(
      mocks.runListingPlanMaintenanceApplicationUseCase.mock.invocationCallOrder[0] ?? -1
    );
  });

  it('retorna 500 com código de erro interno em caso de falha', async () => {
    mocks.runListingPlanMaintenanceApplicationUseCase.mockRejectedValue(
      new Error('Database unavailable')
    );

    await InternalPartnersController.checkExpiringPlans(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao verificar planos expirando.',
      },
    });
  });
});
