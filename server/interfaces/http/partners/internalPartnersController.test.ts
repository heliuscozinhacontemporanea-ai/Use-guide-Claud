import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkExpiringPartnerPlansApplicationUseCase: vi.fn(),
}));

vi.mock(
  '../../../application/usecases/checkExpiringPartnerPlansApplicationUseCase',
  () => ({
    checkExpiringPartnerPlansApplicationUseCase:
      mocks.checkExpiringPartnerPlansApplicationUseCase,
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

  it('retorna 200 com a quantidade de parceiros notificados', async () => {
    mocks.checkExpiringPartnerPlansApplicationUseCase.mockResolvedValue(3);

    await InternalPartnersController.checkExpiringPlans(
      req as Request,
      res as Response
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ notified: 3 });
  });

  it('retorna 500 com código de erro interno em caso de falha', async () => {
    mocks.checkExpiringPartnerPlansApplicationUseCase.mockRejectedValue(
      new Error('Database unavailable')
    );

    await InternalPartnersController.checkExpiringPlans(
      req as Request,
      res as Response
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno ao verificar planos expirando.',
      },
    });
  });
});
