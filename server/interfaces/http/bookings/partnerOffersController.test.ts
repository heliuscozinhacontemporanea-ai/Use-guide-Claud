import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return { BookingDomainError };
});
vi.mock('../../../application/usecases/bookings/checkInBookingApplicationUseCase', () => ({
  checkInBookingApplicationUseCase: vi.fn(),
}));
vi.mock('../../../application/usecases/bookings/recordProviderArrivalApplicationUseCase', () => ({
  recordProviderArrivalApplicationUseCase: vi.fn(),
}));
vi.mock('../../../application/usecases/bookings/checkInWithoutCodeApplicationUseCase', () => ({
  checkInWithoutCodeApplicationUseCase: vi.fn(),
}));
vi.mock('../../../application/usecases/bookings/answerProviderAbsenceApplicationUseCase', () => ({
  answerProviderAbsenceApplicationUseCase: vi.fn(),
}));

import { checkInBookingApplicationUseCase as checkInBookingByCodeUseCase } from '../../../application/usecases/bookings/checkInBookingApplicationUseCase';
import { checkInWithoutCodeApplicationUseCase } from '../../../application/usecases/bookings/checkInWithoutCodeApplicationUseCase';
import { recordProviderArrivalApplicationUseCase } from '../../../application/usecases/bookings/recordProviderArrivalApplicationUseCase';
import { BookingDomainError } from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { PartnerOffersController } from './partnerOffersController';

function response() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
}

function request(body: unknown, uid: string | null = 'partner-1') {
  return {
    params: { offerId: 'offer-1', slotId: 'slot-1', bookingId: 'bk_1' },
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

describe('PartnerOffersController — ações na reserva (D20)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('"Cheguei" aceita sem localização e recusa localização fora do intervalo', async () => {
    vi.mocked(recordProviderArrivalApplicationUseCase).mockResolvedValue({
      id: 'bk_1',
      lines: [],
      offerSnapshot: { title: 'Buggy', startsAt: '', cancellationPolicy: 'flexible' },
    } as never);
    const ok = response();
    await PartnerOffersController.recordArrival(request({}), ok.res);
    expect(recordProviderArrivalApplicationUseCase).toHaveBeenCalledWith(
      { uid: 'partner-1', admin: false },
      'offer-1',
      'bk_1',
      undefined
    );
    const bad = response();
    await PartnerOffersController.recordArrival(
      request({ location: { lat: 200, lng: 0 } }),
      bad.res
    );
    expect(bad.status).toHaveBeenCalledWith(400);
  });

  it('"Cliente sem código" só com motivo da lista', async () => {
    const bad = response();
    await PartnerOffersController.checkInWithoutCode(
      request({ participantsPresent: 2, reason: 'esqueceu' }),
      bad.res
    );
    expect(bad.status).toHaveBeenCalledWith(400);
    expect(checkInWithoutCodeApplicationUseCase).not.toHaveBeenCalled();
  });
});
