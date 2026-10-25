import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ list: vi.fn(), pay: vi.fn(), waive: vi.fn() }));

vi.mock('../../../application/usecases/paymentAccounts/listPartnerDebtsApplicationUseCase', () => ({
  listPartnerDebtsApplicationUseCase: m.list,
}));
vi.mock(
  '../../../application/usecases/paymentAccounts/startPartnerDebtPaymentApplicationUseCase',
  () => ({ startPartnerDebtPaymentApplicationUseCase: m.pay })
);
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return { PaymentDomainError, waiveAccountDebtUseCase: m.waive };
});

import { PaymentDomainError } from '../../../domain/payment/services/stripePaymentService';
import { PaymentAccountController } from './paymentAccountController';

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

describe('PaymentAccountController — dívidas (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lista só as dívidas dos CNPJs de quem está logado', async () => {
    m.list.mockResolvedValue([]);
    const res = response();
    await PaymentAccountController.listDebts(request({}), res as unknown as Response);
    expect(m.list).toHaveBeenCalledWith('owner-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('pagar: ID inválido 400; dívida de outro parceiro (IDOR) 404', async () => {
    const invalid = response();
    await PaymentAccountController.payDebt(
      request({ params: { debtId: '../x' } as never }),
      invalid as unknown as Response
    );
    expect(invalid.status).toHaveBeenCalledWith(400);
    m.pay.mockRejectedValue(new PaymentDomainError('NOT_FOUND', 'Dívida não encontrada.', 404));
    const res = response();
    await PaymentAccountController.payDebt(
      request({ params: { debtId: 'debt_x' } as never }),
      res as unknown as Response
    );
    expect(m.pay).toHaveBeenCalledWith('owner-1', 'debt_x');
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('perdoar é só do admin', async () => {
    const res = response();
    await PaymentAccountController.waiveDebt(
      request({ params: { debtId: 'debt_x' } as never }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(m.waive).not.toHaveBeenCalled();
    m.waive.mockResolvedValue({ id: 'debt_x', status: 'waived' });
    const ok = response();
    await PaymentAccountController.waiveDebt(
      request({ user: ADMIN as never, params: { debtId: 'debt_x' } as never }),
      ok as unknown as Response
    );
    expect(m.waive).toHaveBeenCalledWith('debt_x', 'admin-1');
    expect(ok.json).toHaveBeenCalledWith({ data: { id: 'debt_x', status: 'waived' } });
  });
});
