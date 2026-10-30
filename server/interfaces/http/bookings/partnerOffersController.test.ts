import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return { BookingDomainError, checkInBookingByCodeUseCase: vi.fn() };
});

import { BookingDomainError, checkInBookingByCodeUseCase } from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { PartnerOffersController } from './partnerOffersController';

function response() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
}

function request(body: unknown, uid: string | null = 'partner-1') {
  return {
    params: { offerId: 'offer-1', slotId: 'slot-1' },
    query: {},
    headers: {},
    body,
    user: uid ? { uid, admin: false, emailVerified: true, authTime: 0 } : undefined,
  } as unknown as AuthenticatedRequest;
}

describe('PartnerOffersController.checkIn (D20)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('401 sem autenticação', async () => {
    const { res, status } = response();
    await PartnerOffersController.checkIn(
      request({ code: 'K7M4QX', participantsPresent: 1 }, null),
      res
    );
    expect(status).toHaveBeenCalledWith(401);
  });

  it('400 com campo extra e sem chamar o caso de uso', async () => {
    const { res, status } = response();
    await PartnerOffersController.checkIn(
      request({ code: 'K7M4QX', participantsPresent: 1, bookingId: 'bk_1' }),
      res
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(checkInBookingByCodeUseCase).not.toHaveBeenCalled();
  });

  it('repassa oferta, horário e corpo validados', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockResolvedValue({
      id: 'bk_1',
      status: 'confirmed',
      lines: [],
      offerSnapshot: { title: 'Buggy', startsAt: '', cancellationPolicy: 'flexible' },
      checkIn: { at: 't', byUid: 'partner-1', method: 'code', participantsPresent: 2 },
    } as never);
    const { res, status, json } = response();
    await PartnerOffersController.checkIn(
      request({ code: 'k7m-4qx', participantsPresent: 2 }),
      res
    );
    expect(checkInBookingByCodeUseCase).toHaveBeenCalledWith(
      { uid: 'partner-1', admin: false },
      { offerId: 'offer-1', slotId: 'slot-1', code: 'k7m-4qx', participantsPresent: 2 }
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json.mock.calls[0]?.[0]).toMatchObject({ checkIn: { participantsPresent: 2 } });
  });

  it('muitos erros respondem 429 no formato padrão', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockRejectedValue(
      new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      )
    );
    const { res, status, json } = response();
    await PartnerOffersController.checkIn(request({ code: 'K7M4QX', participantsPresent: 1 }), res);
    expect(status).toHaveBeenCalledWith(429);
    expect(json.mock.calls[0]?.[0]).toMatchObject({ error: { code: 'CHECK_IN_LOCKED' } });
  });
});
