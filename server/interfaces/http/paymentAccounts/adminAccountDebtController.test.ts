import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ list: vi.fn(), waive: vi.fn() }));

vi.mock(
  '../../../application/usecases/paymentAccounts/listAdminAccountDebtsApplicationUseCase',
  () => ({ listAdminAccountDebtsApplicationUseCase: m.list })
);
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return { PaymentDomainError, waiveAccountDebtUseCase: m.waive };
});

import { PaymentDomainError } from '../../../domain/payment/services/stripePaymentService';
import { AdminAccountDebtController } from './adminAccountDebtController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const OWNER = { uid: 'owner-1', admin: false };
const ADMIN = { uid: 'admin-1', admin: true };

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { query: {}, body: {}, params: {}, user: OWNER, ...overrides } as never;
}

describe('AdminAccountDebtController (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista de dívidas é só do admin, com consulta validada', async () => {
    const denied = response();
    await AdminAccountDebtController.listOpen(request({}), denied as unknown as Response);
    expect(denied.status).toHaveBeenCalledWith(403);
    const invalid = response();
    await AdminAccountDebtController.listOpen(
      request({ user: ADMIN as never, query: { extra: '1' } as never }),
      invalid as unknown as Response
    );
    expect(invalid.status).toHaveBeenCalledWith(400);
    m.list.mockResolvedValue({ data: [], nextCursor: null });
    const ok = response();
    await AdminAccountDebtController.listOpen(
      request({ user: ADMIN as never, query: { limit: '20' } as never }),
      ok as unknown as Response
    );
    expect(m.list).toHaveBeenCalledWith(20, undefined);
    expect(ok.json).toHaveBeenCalledWith({ data: [], nextCursor: null });
  });

  it('perdoar é só do admin; dívida quitada responde o code do domínio', async () => {
    const res = response();
    await AdminAccountDebtController.waive(
      request({ params: { debtId: 'debt_x' } as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(m.waive).not.toHaveBeenCalled();
    m.waive.mockResolvedValue({ id: 'debt_x', status: 'waived' });
    const ok = response();
    await AdminAccountDebtController.waive(
      request({ user: ADMIN as never, params: { debtId: 'debt_x' } as never }),
      ok as unknown as Response
    );
    expect(m.waive).toHaveBeenCalledWith('debt_x', 'admin-1');
    expect(ok.json).toHaveBeenCalledWith({ data: { id: 'debt_x', status: 'waived' } });
    m.waive.mockRejectedValue(
      new PaymentDomainError('DEBT_ALREADY_SETTLED', 'Esta dívida já foi quitada.', 409)
    );
    const settled = response();
    await AdminAccountDebtController.waive(
      request({ user: ADMIN as never, params: { debtId: 'debt_x' } as never }),
      settled as unknown as Response
    );
    expect(settled.status).toHaveBeenCalledWith(409);
  });
});
