import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    BookingDomainError,
    checkInEntryUseCase: vi.fn(),
    getEntryVerificationKeysUseCase: vi.fn(),
  };
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
import {
  BookingDomainError,
  checkInEntryUseCase,
  getEntryVerificationKeysUseCase,
} from '../../../domain/bookings';
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
    await PartnerOffersController.checkIn(request({ code: 'K7M4QX' }, null), res);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('400 com campo extra e sem chamar o caso de uso', async () => {
    const { res, status } = response();
    await PartnerOffersController.checkIn(request({ code: 'K7M4QX', bookingId: 'bk_1' }), res);
    expect(status).toHaveBeenCalledWith(400);
    expect(checkInBookingByCodeUseCase).not.toHaveBeenCalled();
  });

  it('repassa oferta, horário e corpo validados', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockResolvedValue({
      unit: 0,
      name: null,
      alreadyCheckedIn: false,
      checkedInAt: 't',
      booking: {
        id: 'bk_1',
        status: 'confirmed',
        lines: [],
        offerSnapshot: { title: 'Buggy', startsAt: '', cancellationPolicy: 'flexible' },
        checkIns: [{ unit: 0, at: 't', byUid: 'partner-1', method: 'code' }],
      },
    } as never);
    const { res, status, json } = response();
    await PartnerOffersController.checkIn(request({ code: 'k7m-4qx' }), res);
    expect(checkInBookingByCodeUseCase).toHaveBeenCalledWith(
      { uid: 'partner-1', admin: false },
      { offerId: 'offer-1', slotId: 'slot-1', code: 'k7m-4qx' }
    );
    expect(status).toHaveBeenCalledWith(200);
    expect(json.mock.calls[0]?.[0]).toMatchObject({
      unit: 0,
      booking: { checkIns: [{ unit: 0 }] },
    });
  });

  it('muitos erros respondem 429 no formato padrão', async () => {
    vi.mocked(checkInBookingByCodeUseCase).mockRejectedValue(
      new BookingDomainError(
        'CHECK_IN_LOCKED',
        'Muitos códigos errados. Tente de novo em 15 minutos.'
      )
    );
    const { res, status, json } = response();
    await PartnerOffersController.checkIn(request({ code: 'K7M4QX' }), res);
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
    await PartnerOffersController.checkInWithoutCode(request({ reason: 'esqueceu' }), bad.res);
    expect(bad.status).toHaveBeenCalledWith(400);
    expect(checkInWithoutCodeApplicationUseCase).not.toHaveBeenCalled();
  });
});

describe('PartnerOffersController — entrada de atração (D20)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('repassa o QR lido e devolve a reserva com o check-in', async () => {
    vi.mocked(checkInEntryUseCase).mockResolvedValue({
      unit: 0,
      name: null,
      alreadyCheckedIn: false,
      checkedInAt: 't',
      booking: {
        id: 'bk_1',
        lines: [],
        offerSnapshot: { title: 'Lagoa', startsAt: '', cancellationPolicy: 'flexible' },
        checkIns: [{ unit: 0, at: 't', byUid: 'partner-1', method: 'qr' }],
      },
    } as never);
    const qrToken = `UGE1.${'a'.repeat(40)}.sig`;
    const { res, status } = response();
    await PartnerOffersController.checkInEntry(request({ qrToken }), res);
    expect(checkInEntryUseCase).toHaveBeenCalledWith(
      { uid: 'partner-1', admin: false },
      { offerId: 'offer-1', slotId: 'slot-1', qrToken }
    );
    expect(status).toHaveBeenCalledWith(200);
  });

  it('QR e código juntos é 400; chaves públicas saem em { data }', async () => {
    const bad = response();
    await PartnerOffersController.checkInEntry(
      request({ qrToken: `UGE1.${'a'.repeat(40)}`, code: 'K7M4QXAB' }),
      bad.res
    );
    expect(bad.status).toHaveBeenCalledWith(400);
    vi.mocked(getEntryVerificationKeysUseCase).mockResolvedValue([
      { kid: 'k1', publicKeyJwk: { kty: 'OKP' } },
    ]);
    const ok = response();
    await PartnerOffersController.entryVerificationKeys(request({}), ok.res);
    expect(ok.json).toHaveBeenCalledWith({ data: [{ kid: 'k1', publicKeyJwk: { kty: 'OKP' } }] });
  });
});
