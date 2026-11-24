import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirmTicketOrderPaymentClientReturnApplicationUseCase } from '../../../application/usecases/confirmTicketOrderPaymentClientReturnApplicationUseCase';
import { createTicketOrderPaymentIntentApplicationUseCase } from '../../../application/usecases/createTicketOrderPaymentIntentApplicationUseCase';
import { processTicketRefundApplicationUseCase } from '../../../application/usecases/processTicketRefundApplicationUseCase';
import { OrderNotFoundError, RefundNotAllowedError } from '../../../domain/ticketing';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { TicketOrderPaymentController } from './ticketOrderPaymentController';

vi.mock('../../../application/usecases/createTicketOrderPaymentIntentApplicationUseCase', () => ({
  createTicketOrderPaymentIntentApplicationUseCase: vi.fn(),
}));
vi.mock(
  '../../../application/usecases/confirmTicketOrderPaymentClientReturnApplicationUseCase',
  () => ({
    confirmTicketOrderPaymentClientReturnApplicationUseCase: vi.fn(),
  })
);
vi.mock('../../../application/usecases/processTicketRefundApplicationUseCase', () => ({
  processTicketRefundApplicationUseCase: vi.fn(),
}));

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

const buyer = (body: unknown = {}, query: Record<string, string> = {}) =>
  ({
    user: { uid: 'ana', emailVerified: true },
    params: { id: 'order-1' },
    body,
    query,
  }) as unknown as AuthenticatedRequest;

const ACTOR = { uid: 'ana', admin: false, role: 'user', emailVerified: true };

describe('TicketOrderPaymentController (pagar e reembolsar ingresso)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sem login responde 401 nas três ações', async () => {
    for (const action of [
      TicketOrderPaymentController.createOrderPaymentIntent,
      TicketOrderPaymentController.confirmOrderPaymentReturn,
      TicketOrderPaymentController.requestRefund,
    ]) {
      const res = response();
      await action(
        { params: {}, body: {}, query: {} } as unknown as AuthenticatedRequest,
        res as unknown as Response
      );
      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({ error: { code: 'UNAUTHENTICATED', message: expect.any(String) } });
    }
  });

  it('pagar: usa a chave do app ou gera uma no servidor; preço nunca vem do corpo', async () => {
    vi.mocked(createTicketOrderPaymentIntentApplicationUseCase).mockResolvedValue({
      clientSecret: 'cs',
    } as never);
    let res = response();
    await TicketOrderPaymentController.createOrderPaymentIntent(
      buyer({ idempotencyKey: 'chave-1' }),
      res as unknown as Response
    );
    expect(createTicketOrderPaymentIntentApplicationUseCase).toHaveBeenLastCalledWith(ACTOR, {
      orderId: 'order-1',
      idempotencyKey: 'chave-1',
    });
    expect(res.statusCode).toBe(200);

    res = response();
    await TicketOrderPaymentController.createOrderPaymentIntent(
      buyer({}),
      res as unknown as Response
    );
    const call = vi.mocked(createTicketOrderPaymentIntentApplicationUseCase).mock.lastCall;
    expect(call?.[1].idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);

    res = response();
    await TicketOrderPaymentController.createOrderPaymentIntent(
      buyer({ totalMinor: 1 }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ error: { code: 'VALIDATION_ERROR' } });
  });

  it('confirmar o retorno exige o paymentIntentId', async () => {
    let res = response();
    await TicketOrderPaymentController.confirmOrderPaymentReturn(
      buyer({}),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(400);

    vi.mocked(confirmTicketOrderPaymentClientReturnApplicationUseCase).mockResolvedValueOnce({
      status: 'paid',
    } as never);
    res = response();
    await TicketOrderPaymentController.confirmOrderPaymentReturn(
      buyer({}, { paymentIntentId: 'pi_123' }),
      res as unknown as Response
    );
    expect(confirmTicketOrderPaymentClientReturnApplicationUseCase).toHaveBeenCalledWith(ACTOR, {
      orderId: 'order-1',
      paymentIntentId: 'pi_123',
    });
    expect(res.statusCode).toBe(200);
  });

  it('reembolso: 201 na primeira vez, 200 quando repete a mesma chave', async () => {
    const body = { reason: 'Não posso ir', idempotencyKey: 'ref-1' };
    vi.mocked(processTicketRefundApplicationUseCase)
      .mockResolvedValueOnce({ refund: { id: 'r1' }, isReplay: false } as never)
      .mockResolvedValueOnce({ refund: { id: 'r1' }, isReplay: true } as never);
    let res = response();
    await TicketOrderPaymentController.requestRefund(buyer(body), res as unknown as Response);
    expect(res.statusCode).toBe(201);
    res = response();
    await TicketOrderPaymentController.requestRefund(buyer(body), res as unknown as Response);
    expect(res.statusCode).toBe(200);
  });

  it('erros do domínio saem com código estável; inesperado vira 500 sem detalhe', async () => {
    vi.mocked(processTicketRefundApplicationUseCase).mockRejectedValueOnce(
      new RefundNotAllowedError()
    );
    let res = response();
    await TicketOrderPaymentController.requestRefund(
      buyer({ reason: 'x', idempotencyKey: 'k' }),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(422);
    expect(res.body).toMatchObject({ error: { code: 'UNPROCESSABLE_ENTITY' } });

    vi.mocked(createTicketOrderPaymentIntentApplicationUseCase).mockRejectedValueOnce(
      new OrderNotFoundError()
    );
    res = response();
    await TicketOrderPaymentController.createOrderPaymentIntent(
      buyer({}),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(404);

    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(createTicketOrderPaymentIntentApplicationUseCase).mockRejectedValueOnce(
      new Error('stripe: sk_test_segredo')
    );
    res = response();
    await TicketOrderPaymentController.createOrderPaymentIntent(
      buyer({}),
      res as unknown as Response
    );
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('sk_test');
  });
});
