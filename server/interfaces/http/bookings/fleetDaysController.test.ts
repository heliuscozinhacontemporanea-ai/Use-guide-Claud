import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../domain/bookings', async () => {
  const { BookingDomainError } = await import('../../../domain/bookings/errors/bookingDomainError');
  return {
    BookingDomainError,
    openFleetDaysUseCase: vi.fn(),
    listFleetDaysForPartnerUseCase: vi.fn(),
    getPublicFleetDayUseCase: vi.fn(),
  };
});

import {
  BookingDomainError,
  getPublicFleetDayUseCase,
  listFleetDaysForPartnerUseCase,
  openFleetDaysUseCase,
} from '../../../domain/bookings';
import type { AuthenticatedRequest } from '../../../infrastructure/auth/authenticatedRequest';
import { FleetDaysController } from './fleetDaysController';

function response() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
}

function request(parts: { body?: unknown; query?: unknown; date?: string; uid?: string | null }) {
  const uid = parts.uid === undefined ? 'partner-1' : parts.uid;
  return {
    params: { offerId: 'offer-1', date: parts.date ?? '2026-11-21' },
    query: parts.query ?? {},
    headers: {},
    body: parts.body,
    user: uid ? { uid, admin: false, emailVerified: true, authTime: 0 } : undefined,
  } as unknown as AuthenticatedRequest;
}

const OPEN = { startDate: '2026-11-21', endDate: '2026-11-30', weekdays: [5, 6], vehicles: 3 };

describe('FleetDaysController (F3b)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('abrir dias: 401 sem login, 400 com corpo inválido ou campo a mais, 200 com os dias', async () => {
    const anonymous = response();
    await FleetDaysController.open(request({ body: OPEN, uid: null }), anonymous.res);
    expect(anonymous.status).toHaveBeenCalledWith(401);

    for (const body of [
      { ...OPEN, vehicles: -1 },
      { ...OPEN, weekdays: [] },
      { ...OPEN, ownerId: 'x' },
    ]) {
      const bad = response();
      await FleetDaysController.open(request({ body }), bad.res);
      expect(bad.status).toHaveBeenCalledWith(400);
      expect(bad.json).toHaveBeenCalledWith({
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      });
    }
    expect(openFleetDaysUseCase).not.toHaveBeenCalled();

    vi.mocked(openFleetDaysUseCase).mockResolvedValue([
      { date: '2026-11-21', vehicles: 3, busy: [] },
    ]);
    const ok = response();
    await FleetDaysController.open(request({ body: OPEN }), ok.res);
    expect(openFleetDaysUseCase).toHaveBeenCalledWith(
      { uid: 'partner-1', admin: false },
      'offer-1',
      OPEN
    );
    expect(ok.status).toHaveBeenCalledWith(200);
  });

  it('veículos abaixo do reservado devolve 409 com o código', async () => {
    vi.mocked(openFleetDaysUseCase).mockRejectedValue(
      new BookingDomainError('VEHICLES_BELOW_BOOKED', 'Este dia já tem mais veículos reservados.')
    );
    const { res, status, json } = response();
    await FleetDaysController.open(request({ body: OPEN }), res);
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      error: expect.objectContaining({ code: 'VEHICLES_BELOW_BOOKED' }),
    });
  });

  it('listar exige o período; dia público exige uma data válida e não pede login', async () => {
    const noRange = response();
    await FleetDaysController.list(request({ query: {} }), noRange.res);
    expect(noRange.status).toHaveBeenCalledWith(400);
    vi.mocked(listFleetDaysForPartnerUseCase).mockResolvedValue([]);
    const listed = response();
    await FleetDaysController.list(
      request({ query: { from: '2026-11-21', to: '2026-11-30' } }),
      listed.res
    );
    expect(listed.status).toHaveBeenCalledWith(200);

    const badDate = response();
    await FleetDaysController.publicDay(request({ date: '21/11/2026', uid: null }), badDate.res);
    expect(badDate.status).toHaveBeenCalledWith(400);
    vi.mocked(getPublicFleetDayUseCase).mockResolvedValue({
      date: '2026-11-21',
      vehicles: 2,
      busy: [],
      fixed: [],
    });
    const day = response();
    await FleetDaysController.publicDay(request({ uid: null }), day.res);
    expect(getPublicFleetDayUseCase).toHaveBeenCalledWith('offer-1', '2026-11-21');
    expect(day.status).toHaveBeenCalledWith(200);
  });
});
