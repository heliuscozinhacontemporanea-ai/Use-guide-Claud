import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';

const m = vi.hoisted(() => ({ invite: vi.fn(), accept: vi.fn(), list: vi.fn() }));

vi.mock(
  '../../../application/usecases/courtesies/inviteCourtesyByUsernameApplicationUseCase',
  () => ({ inviteCourtesyByUsernameApplicationUseCase: m.invite })
);
vi.mock('../../../application/usecases/courtesies/acceptCourtesyLinkApplicationUseCase', () => ({
  acceptCourtesyLinkApplicationUseCase: m.accept,
}));
vi.mock('../../../application/usecases/courtesies/cancelCourtesyApplicationUseCase', () => ({
  cancelCourtesyApplicationUseCase: vi.fn(),
}));
vi.mock('../../../application/usecases/courtesies/previewCourtesyLinkApplicationUseCase', () => ({
  previewCourtesyLinkApplicationUseCase: vi.fn(),
}));
vi.mock('../../../domain/ticketing', async () => {
  const { CourtesyError } = await import('../../../domain/ticketing/errors/courtesyError');
  const { TicketingDomainError } = await import(
    '../../../domain/ticketing/errors/ticketingDomainError'
  );
  return {
    CourtesyError,
    TicketingDomainError,
    createCourtesyLinkUseCase: vi.fn(),
    listEventCourtesiesUseCase: m.list,
  };
});

import { CourtesyError } from '../../../domain/ticketing/errors/courtesyError';
import { CourtesyController } from './courtesyController';

function response() {
  const res = { status: vi.fn(), json: vi.fn(), send: vi.fn(), setHeader: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

const PARTNER = { uid: 'partner', admin: false, emailVerified: true, authTime: 1 };

function request(overrides: Partial<AuthenticatedRequest>): AuthenticatedRequest {
  return { params: {}, body: {}, query: {}, user: PARTNER, ...overrides } as never;
}

describe('CourtesyController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('convite: 401 sem login e 400 com campo a mais, sem chamar o caso de uso', async () => {
    const res = response();
    await CourtesyController.invite(request({ user: undefined }), res as unknown as Response);
    expect(res.status).toHaveBeenCalledWith(401);
    const res2 = response();
    await CourtesyController.invite(
      request({ body: { occurrenceId: 'oc1', username: 'bia.reis', priceMinor: 0 } }),
      res2 as unknown as Response
    );
    expect(res2.status).toHaveBeenCalledWith(400);
    expect(m.invite).not.toHaveBeenCalled();
  });

  it('erro da cortesia sai com status e código estáveis', async () => {
    m.invite.mockRejectedValue(new CourtesyError('COURTESY_ALREADY_GIVEN', 'Já tem.'));
    const res = response();
    await CourtesyController.invite(
      request({ body: { occurrenceId: 'oc1', username: 'bia.reis' } }),
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'COURTESY_ALREADY_GIVEN', message: 'Já tem.' },
    });
  });

  it('aceite usa o e-mail confirmado do token, nunca do corpo', async () => {
    m.accept.mockResolvedValue({ ticketId: 't1' });
    const res = response();
    await CourtesyController.acceptLink(
      request({
        params: { courtesyId: 'c1' } as never,
        body: { token: 'a'.repeat(43) },
        user: { ...PARTNER, uid: 'bia', emailVerified: false },
      }),
      res as unknown as Response
    );
    expect(m.accept).toHaveBeenCalledWith(
      { uid: 'bia', emailVerified: false },
      'c1',
      'a'.repeat(43)
    );
  });
});
