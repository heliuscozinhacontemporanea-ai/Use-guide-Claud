import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  runListingPlanMaintenanceApplicationUseCase: vi.fn(),
}));

vi.mock(
  '../../../application/usecases/listingPlans/runListingPlanMaintenanceApplicationUseCase',
  () => ({
    runListingPlanMaintenanceApplicationUseCase: mocks.runListingPlanMaintenanceApplicationUseCase,
  })
);

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

  it('retorna 200 com os selos vencidos e os avisos enviados', async () => {
    mocks.runListingPlanMaintenanceApplicationUseCase.mockResolvedValue({
      expired: 1,
      notified: 3,
    });

    await InternalPartnersController.checkExpiringPlans(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ expired: 1, notified: 3 });
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
