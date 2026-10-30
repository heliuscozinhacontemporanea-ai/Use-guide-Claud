import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../application/usecases/bookings/createBookingApplicationUseCase', () => ({
  createBookingApplicationUseCase: vi.fn(),
}));
vi.mock('../../../application/usecases/bookings/cancelBookingByBuyerApplicationUseCase', () => ({
  cancelBookingByBuyerApplicationUseCase: vi.fn(),
}));
vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    BookingDomainError,
    getBookingCheckInCodeUseCase: vi.fn(),
    getBookingForActorUseCase: vi.fn(),
    listAvailableSlotsUseCase: vi.fn(),
    listMyBookingsUseCase: vi.fn(),
    markBookingNoShowUseCase: vi.fn(),
  };
});

import { createBookingApplicationUseCase } from '../../../application/usecases/bookings/createBookingApplicationUseCase';
import {
  BookingDomainError,
  getBookingCheckInCodeUseCase,
  getBookingForActorUseCase,
  listMyBookingsUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { BookingsController } from './bookingsController';

function response() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const setHeader = vi.fn();
  return { res: { status, setHeader } as unknown as Response, status, json, setHeader };
}

function request(parts: Partial<AuthenticatedRequest>, uid: string | null = 'buyer-1') {
  return {
    params: {},
    query: {},
    headers: {},
    body: {},
    user: uid ? { uid, admin: false, emailVerified: true, authTime: 0 } : undefined,
    ...parts,
  } as unknown as AuthenticatedRequest;
}

const BOOKING = {
  id: 'bk_1',
  offerId: 'offer-1',
  slotId: 'slot-1',
  guideItemId: 'item-1',
  buyerId: 'buyer-1',
  sellerPartnerId: 'p1',
  kind: 'tour',
  status: 'confirmed',
  lines: [],
  participantsCount: 2,
  subtotalMinor: 20000,
  platformFeeMinor: 2000,
  totalMinor: 20000,
  expiresAt: null,
  paymentIntentId: 'pi_secret_ref',
  idempotencyKey: 'key-12345',
  offerSnapshot: {
    title: 'Passeio',
    startsAt: '2026-11-10T11:00:00.000Z',
    cancellationPolicy: 'flexible',
  },
  locale: 'pt-BR',
  createdAt: '',
  updatedAt: '',
};

const VALID_BODY = {
  offerId: 'offer-1',
  slotId: 'slot-1',
  lines: [{ priceOptionId: 'adult', quantity: 2 }],
  locale: 'pt-BR',
  acceptedTermsVersion: '2026-10-25',
};

describe('BookingsController', () => {
  beforeEach(() => vi.clearAllMocks());

  it('401 sem autenticação', async () => {
    const { res, status } = response();
    await BookingsController.create(request({ body: VALID_BODY }, null), res);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('400 com preço ou campo extra vindo do cliente', async () => {
    const { res, status } = response();
    await BookingsController.create(
      request({ body: { ...VALID_BODY, idempotencyKey: 'key-12345', totalMinor: 1 } }),
      res
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(createBookingApplicationUseCase).not.toHaveBeenCalled();
  });

  it('400 sem chave de idempotência no corpo nem no header', async () => {
    const { res, status } = response();
    await BookingsController.create(request({ body: VALID_BODY }), res);
    expect(status).toHaveBeenCalledWith(400);
  });

  it('aceita Idempotency-Key no header e repassa e-mail verificado', async () => {
    vi.mocked(createBookingApplicationUseCase).mockResolvedValue({
      bookingId: 'bk_1',
      status: 'pending_payment',
      clientSecret: 's',
      totalMinor: 20000,
      expiresAt: null,
    });
    const { res, status } = response();
    await BookingsController.create(
      request({ body: VALID_BODY, headers: { 'idempotency-key': 'header-key-123' } }),
      res
    );
    expect(createBookingApplicationUseCase).toHaveBeenCalledWith(
      { uid: 'buyer-1', admin: false, emailVerified: true },
      expect.objectContaining({ idempotencyKey: 'header-key-123', participants: [] })
    );
    expect(status).toHaveBeenCalledWith(201);
  });

  it('IDOR: reserva de outro usuário responde 404 no formato padrão', async () => {
    vi.mocked(getBookingForActorUseCase).mockRejectedValue(
      new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.')
    );
    const { res, status, json } = response();
    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }, 'intruso'), res);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Reserva não encontrada.' },
    });
  });

  it('comprador não recebe paymentIntentId, taxa nem ID do comprador', async () => {
    vi.mocked(getBookingForActorUseCase).mockResolvedValue({
      booking: BOOKING as never,
      participants: [{ name: 'Ana', isLeadContact: true }],
    });
    const { res, json } = response();
    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }), res);
    const body = JSON.stringify(json.mock.calls[0]?.[0]);
    expect(body).not.toContain('pi_secret_ref');
    expect(body).not.toContain('platformFeeMinor');
    expect(body).not.toContain('idempotencyKey');
    expect(body).toContain('Ana');
  });

  it('lista "minhas reservas" com paginação por cursor', async () => {
    vi.mocked(listMyBookingsUseCase).mockResolvedValue({
      data: [BOOKING as never],
      nextCursor: 'bk_1',
    });
    const { res, json } = response();
    await BookingsController.listMine(request({ query: { limit: '10' } }), res);
    expect(listMyBookingsUseCase).toHaveBeenCalledWith(
      { uid: 'buyer-1', admin: false },
      { limit: 10 }
    );
    expect(json.mock.calls[0]?.[0]).toMatchObject({ nextCursor: 'bk_1' });
  });

  it('janela de horários acima de 62 dias é recusada', async () => {
    const { res, status } = response();
    await BookingsController.listSlots(
      request({
        params: { offerId: 'offer-1' },
        query: { from: '2026-11-01T00:00:00.000Z', to: '2027-02-01T00:00:00.000Z' },
      }),
      res
    );
    expect(status).toHaveBeenCalledWith(400);
  });

  it('erro inesperado vira 500 sem detalhe interno', async () => {
    vi.mocked(getBookingForActorUseCase).mockRejectedValue(new Error('firestore quota exceeded'));
    const { res, status, json } = response();
    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }), res);
    expect(status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('quota');
  });

  it('código de check-in sai sem cache e só com os campos da visão (D20)', async () => {
    vi.mocked(getBookingCheckInCodeUseCase).mockResolvedValue({
      code: 'K7M4QX',
      visibleFrom: '2026-11-10T03:00:00.000Z',
      validUntil: '2026-11-11T01:00:00.000Z',
      checkedInAt: null,
    });
    const { res, status, json, setHeader } = response();
    await BookingsController.getCheckInCode(request({ params: { bookingId: 'bk_1' } }), res);
    expect(getBookingCheckInCodeUseCase).toHaveBeenCalledWith(
      { uid: 'buyer-1', admin: false },
      'bk_1'
    );
    expect(setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
    expect(status).toHaveBeenCalledWith(200);
    expect(json.mock.calls[0]?.[0]).toMatchObject({ code: 'K7M4QX' });
  });

  it('código de check-in de outra pessoa responde 404 (IDOR)', async () => {
    vi.mocked(getBookingCheckInCodeUseCase).mockRejectedValue(
      new BookingDomainError('NOT_FOUND', 'Reserva não encontrada.')
    );
    const { res, status } = response();
    await BookingsController.getCheckInCode(
      request({ params: { bookingId: 'bk_1' } }, 'intruso'),
      res
    );
    expect(status).toHaveBeenCalledWith(404);
  });

  it('a resposta da reserva traz o check-in e o endereço de busca, sem o código', async () => {
    vi.mocked(getBookingForActorUseCase).mockResolvedValue({
      booking: {
        ...BOOKING,
        pickupAddress: 'Pousada Vila Jeri',
        checkIn: {
          at: '2026-11-10T11:02:00.000Z',
          byUid: 'p1',
          method: 'code',
          participantsPresent: 2,
        },
      } as never,
      participants: [],
    });
    const { res, json } = response();
    await BookingsController.get(request({ params: { bookingId: 'bk_1' } }), res);
    expect(json.mock.calls[0]?.[0]).toMatchObject({
      pickupAddress: 'Pousada Vila Jeri',
      checkIn: { at: '2026-11-10T11:02:00.000Z', participantsPresent: 2 },
    });
    expect(JSON.stringify(json.mock.calls[0]?.[0])).not.toContain('byUid');
  });
});
