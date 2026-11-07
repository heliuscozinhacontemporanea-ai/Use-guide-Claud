import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ invite: vi.fn(), respond: vi.fn() }));
vi.mock('../../../application/usecases/promoters/invitePromoterApplicationUseCase', () => ({
  invitePromoterApplicationUseCase: m.invite,
}));
vi.mock('../../../application/usecases/promoters/respondPromoterInviteApplicationUseCase', () => ({
  respondPromoterInviteApplicationUseCase: m.respond,
}));
vi.mock('../../../application/usecases/promoters/listMyPromotionsApplicationUseCase', () => ({
  listMyPromotionsApplicationUseCase: vi.fn(),
}));
vi.mock('../../../domain/ticketing', async () => {
  const { PromoterError } = await import('../../../domain/ticketing/errors/promoterError');
  const { TicketingDomainError } = await import(
    '../../../domain/ticketing/errors/ticketingDomainError'
  );
  return {
    PromoterError,
    TicketingDomainError,
    endPromoterUseCase: vi.fn(),
    getEventPromotersUseCase: vi.fn(),
  };
});

import { PromoterError } from '../../../domain/ticketing/errors/promoterError';
import { PromoterController } from './promoterController';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const USER = { uid: 'partner', admin: false, emailVerified: true, authTime: 1 };
const request = (overrides: Partial<AuthenticatedRequest>) =>
  ({ params: {}, body: {}, query: {}, user: USER, ...overrides }) as never;

describe('PromoterController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('ganho fora da faixa ou campo a mais: 400 sem chamar o caso de uso', async () => {
    for (const body of [
      {
        eventListingId: 'ev1',
        username: 'joao',
        earning: { type: 'commission', basisPoints: 20_000 },
      },
      { eventListingId: 'ev1', username: 'joao', earning: { type: 'flat_fee', amountMinor: 1.5 } },
      {
        eventListingId: 'ev1',
        username: 'joao',
        earning: { type: 'per_ticket', amountMinor: 1500, x: 1 },
      },
    ]) {
      const res = response();
      await PromoterController.invite(request({ body }), res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(400);
    }
    expect(m.invite).not.toHaveBeenCalled();
  });

  it('erro do divulgador sai com status e código estáveis', async () => {
    m.invite.mockRejectedValue(new PromoterError('PROMOTER_ALREADY_INVITED', 'Já convidado.'));
    const res = response();
    await PromoterController.invite(
      request({
        body: {
          eventListingId: 'ev1',
          username: 'joao',
          earning: { type: 'commission', basisPoints: 1000 },
        },
      }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'PROMOTER_ALREADY_INVITED', message: 'Já convidado.' },
    });
  });

  it('resposta ao convite usa a conta do token', async () => {
    const res = response();
    await PromoterController.respond(
      request({
        params: { promoterId: 'p1' } as never,
        body: { accept: true },
        user: { ...USER, uid: 'joao' },
      }),
      res as unknown as Response
    );
    expect(m.respond).toHaveBeenCalledWith('joao', 'p1', true);
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
