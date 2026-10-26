import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ open: vi.fn(), decide: vi.fn(), mine: vi.fn(), pending: vi.fn() }));

vi.mock('../../../application/usecases/payouts/openSaleClaimApplicationUseCase', () => ({
  openSaleClaimApplicationUseCase: m.open,
}));
vi.mock('../../../application/usecases/payouts/decideSaleClaimApplicationUseCase', () => ({
  decideSaleClaimApplicationUseCase: m.decide,
}));
vi.mock('../../../application/usecases/payouts/listAdminSaleClaimsApplicationUseCase', () => ({
  listAdminSaleClaimsApplicationUseCase: m.pending,
}));
vi.mock('../../../domain/payment', async () => {
  const { PaymentDomainError } = await import(
    '../../../domain/payment/services/stripePaymentService'
  );
  return {
    PaymentDomainError,
    listMySaleClaimsUseCase: m.mine,
  };
});

import { PaymentDomainError } from '../../../domain/payment/services/stripePaymentService';
import { SALE_CLAIM_REASONS } from '../../../domain/payment/types/saleClaim';
import { SALE_CLAIM_REASON_VALUES } from './schemas/saleClaimSchemas';
import { SaleClaimController } from './saleClaimController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const BUYER = { uid: 'buyer-1', admin: false };
const ADMIN = { uid: 'admin-1', admin: true };
const VALID = { referenceType: 'booking', referenceId: 'bk_1', reason: 'did_not_happen' };

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { query: {}, body: {}, params: {}, user: BUYER, ...overrides } as never;
}

describe('SaleClaimController (D16)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('motivos do schema iguais aos do domínio', () => {
    expect([...SALE_CLAIM_REASON_VALUES]).toEqual([...SALE_CLAIM_REASONS]);
  });

  it('abrir: sem login 401; motivo fora da lista ou campo extra 400', async () => {
    const anonymous = response();
    await SaleClaimController.open(
      request({ user: undefined, body: VALID }),
      anonymous as unknown as Response
    );
    expect(anonymous.status).toHaveBeenCalledWith(401);
    for (const body of [
      { ...VALID, reason: 'refund_me' },
      { ...VALID, buyerUid: 'buyer-2' },
      { ...VALID, details: 'x'.repeat(501) },
    ]) {
      const res = response();
      await SaleClaimController.open(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(m.open).not.toHaveBeenCalled();
  });

  it('abrir: 201, sempre em nome de quem está logado', async () => {
    m.open.mockResolvedValue({ id: 'claim_x' });
    const res = response();
    await SaleClaimController.open(request({ body: VALID }), res as unknown as Response);
    expect(m.open).toHaveBeenCalledWith({ uid: 'buyer-1', admin: false }, VALID);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('erro do domínio mantém código e status; erro inesperado vira 503 sem detalhe', async () => {
    m.open.mockRejectedValueOnce(
      new PaymentDomainError('CLAIM_WINDOW_CLOSED', 'Prazo encerrado.', 422)
    );
    const closed = response();
    await SaleClaimController.open(request({ body: VALID }), closed as unknown as Response);
    expect(closed.status).toHaveBeenCalledWith(422);
    m.open.mockRejectedValueOnce(new Error('StripeAPIError sk_test_123'));
    const broken = response();
    await SaleClaimController.open(request({ body: VALID }), broken as unknown as Response);
    expect(broken.status).toHaveBeenCalledWith(503);
    expect(JSON.stringify(broken.json.mock.calls)).not.toContain('sk_test');
  });

  it('fila e decisão: só admin', async () => {
    for (const handler of [SaleClaimController.listPending, SaleClaimController.decide]) {
      const res = response();
      await handler(
        request({ params: { claimId: 'claim_x' } as never, body: { outcome: 'release' } }),
        res as unknown as Response
      );
      expect(res.status).toHaveBeenCalledWith(403);
    }
    expect(m.pending).not.toHaveBeenCalled();
    expect(m.decide).not.toHaveBeenCalled();
  });

  it('decisão: parcial exige valor; integral não aceita valor', async () => {
    for (const body of [
      { outcome: 'refund_partial' },
      { outcome: 'refund_full', amountMinor: 100 },
      { outcome: 'release', amountMinor: 100 },
    ]) {
      const res = response();
      await SaleClaimController.decide(
        request({ user: ADMIN as never, params: { claimId: 'claim_x' } as never, body }),
        res as unknown as Response
      );
      expect(res.status).toHaveBeenCalledWith(400);
    }
    m.decide.mockResolvedValue({ id: 'claim_x', status: 'refund_pending', refundAmountMinor: 500 });
    const ok = response();
    await SaleClaimController.decide(
      request({
        user: ADMIN as never,
        params: { claimId: 'claim_x' } as never,
        body: { outcome: 'refund_partial', amountMinor: 500 },
      }),
      ok as unknown as Response
    );
    expect(m.decide).toHaveBeenCalledWith('admin-1', 'claim_x', {
      outcome: 'refund_partial',
      amountMinor: 500,
    });
    expect(ok.json).toHaveBeenCalledWith({
      data: { id: 'claim_x', status: 'refund_pending', refundAmountMinor: 500 },
    });
  });

  it('fila do admin paginada por cursor', async () => {
    m.pending.mockResolvedValue({ data: [], nextCursor: null });
    const res = response();
    await SaleClaimController.listPending(
      request({ user: ADMIN as never, query: { limit: '20', cursor: 'claim_a' } as never }),
      res as unknown as Response
    );
    expect(m.pending).toHaveBeenCalledWith(20, 'claim_a');
    expect(res.json).toHaveBeenCalledWith({ data: [], nextCursor: null });
  });
});
