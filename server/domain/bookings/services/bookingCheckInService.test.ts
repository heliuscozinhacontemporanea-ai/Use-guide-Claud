import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableOffer, Booking } from '../types/bookingTypes';
import { deriveCheckInCode } from '../utils/checkInCode';
import { BookingCheckInService } from './bookingCheckInService';

const STARTS_AT = '2026-11-10T11:00:00.000Z';
const PARTNER = { uid: 'partner-1', admin: false };
const BUYER = { uid: 'buyer-1', admin: false };

function offer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-1',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'tour',
    title: { 'pt-BR': 'Buggy' },
    status: 'published',
    pricing: { currency: 'BRL', priceOptions: [] },
    durationMinutes: 120,
    cancellationPolicy: 'moderate',
    maxParticipantsPerBooking: 6,
    requiresParticipantNames: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function booking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'tour',
    status: 'confirmed',
    lines: [],
    participantsCount: 4,
    subtotalMinor: 40000,
    platformFeeMinor: 6000,
    totalMinor: 40000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Buggy',
      startsAt: STARTS_AT,
      durationMinutes: 120,
      cancellationPolicy: 'moderate',
    },
    locale: 'pt-BR',
    idempotencyKey: `key-${id}`,
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

function setup(now = '2026-11-10T11:05:00.000Z', offerOverrides: Partial<BookableOffer> = {}) {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', offer(offerOverrides));
  port.offers.set(
    'offer-2',
    offer({ id: 'offer-2', ownerId: 'partner-2', partnerId: 'partner-2' })
  );
  port.slots.set('slot-1', {
    id: 'slot-1',
    offerId: 'offer-1',
    startsAt: STARTS_AT,
    capacityTotal: 10,
    capacityReserved: 0,
    capacitySold: 5,
    status: 'open',
    createdAt: '',
    updatedAt: '',
  });
  port.bookings.set('booking-1', booking('booking-1'));
  port.bookings.set(
    'booking-2',
    booking('booking-2', { buyerId: 'buyer-2', participantsCount: 1 })
  );
  let current = new Date(now);
  const service = new BookingCheckInService(port, () => current);
  return {
    port,
    service,
    setNow: (iso: string) => {
      current = new Date(iso);
    },
  };
}

const checkIn = (code: string, extra: Record<string, unknown> = {}) => ({
  offerId: 'offer-1',
  slotId: 'slot-1',
  code,
  participantsPresent: 3,
  ...extra,
});

describe('BookingCheckInService (D20)', () => {
  beforeEach(() => {
    process.env.BOOKING_CHECKIN_CODE_SECRET = 's'.repeat(32);
  });
  afterEach(() => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
  });

  it('o comprador só vê o código a partir das 00:00 de Fortaleza do dia do serviço', async () => {
    const { service, setNow } = setup('2026-11-10T02:59:00.000Z');
    const before = await service.getCheckInCode(BUYER, 'booking-1');
    expect(before).toMatchObject({ code: null, visibleFrom: '2026-11-10T03:00:00.000Z' });
    setNow('2026-11-10T03:00:00.000Z');
    const view = await service.getCheckInCode(BUYER, 'booking-1');
    expect(view.code).toBe(deriveCheckInCode('booking-1'));
    expect(view.validUntil).toBe('2026-11-11T01:00:00.000Z');
  });

  it('outra pessoa não vê o código: responde como inexistente (IDOR)', async () => {
    const { service } = setup();
    await expect(service.getCheckInCode(PARTNER, 'booking-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('entrada de atração privada não usa código', async () => {
    const { service, port } = setup();
    port.bookings.set('booking-3', booking('booking-3', { kind: 'private_entry' }));
    await expect(service.getCheckInCode(BUYER, 'booking-3')).rejects.toMatchObject({
      code: 'CHECK_IN_NOT_APPLICABLE',
    });
  });

  it('o dono da oferta faz check-in com o código e informa os presentes', async () => {
    const { service, port } = setup();
    const code = deriveCheckInCode('booking-1');
    const updated = await service.checkInByCode(
      PARTNER,
      checkIn(`${code.slice(0, 3).toLowerCase()}-${code.slice(3)}`)
    );
    expect(updated.id).toBe('booking-1');
    expect(updated.checkIn).toMatchObject({
      at: '2026-11-10T11:05:00.000Z',
      byUid: 'partner-1',
      method: 'code',
      participantsPresent: 3,
    });
    expect(port.audit.at(-1)).toEqual({ bookingId: 'booking-1', reason: 'checked_in' });
    // Repetir não muda o check-in já gravado.
    const again = await service.checkInByCode(PARTNER, checkIn(code, { participantsPresent: 1 }));
    expect(again.checkIn?.participantsPresent).toBe(3);
  });

  it('depois do check-in o comprador não vê mais o código', async () => {
    const { service } = setup();
    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
    const view = await service.getCheckInCode(BUYER, 'booking-1');
    expect(view).toMatchObject({ code: null, checkedInAt: '2026-11-10T11:05:00.000Z' });
  });

  it('outro parceiro e o admin não fazem check-in na oferta (IDOR)', async () => {
    const { service } = setup();
    const code = deriveCheckInCode('booking-1');
    await expect(
      service.checkInByCode({ uid: 'partner-2', admin: false }, checkIn(code))
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.checkInByCode({ uid: 'admin-1', admin: true }, checkIn(code))
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(
      service.checkInByCode(PARTNER, { ...checkIn(code), offerId: 'offer-2' })
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('código errado conta tentativa e trava o horário depois de 5 erros em 15 min', async () => {
    const { service, port, setNow } = setup();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.checkInByCode(PARTNER, checkIn('ZZZZZZ'))).rejects.toMatchObject({
        code: 'INVALID_CHECK_IN_CODE',
      });
    }
    expect(port.checkInFailures).toHaveLength(5);
    const code = deriveCheckInCode('booking-1');
    await expect(service.checkInByCode(PARTNER, checkIn(code))).rejects.toMatchObject({
      code: 'CHECK_IN_LOCKED',
    });
    setNow('2026-11-10T11:21:00.000Z');
    await expect(service.checkInByCode(PARTNER, checkIn(code))).resolves.toMatchObject({
      id: 'booking-1',
    });
  });

  it('texto que nem é código também conta como tentativa', async () => {
    const { service, port } = setup();
    await expect(service.checkInByCode(PARTNER, checkIn('abc 01'))).rejects.toMatchObject({
      code: 'INVALID_CHECK_IN_CODE',
    });
    expect(port.checkInFailures).toHaveLength(1);
  });

  it('fora da janela (antes de 2 h do início ou 12 h depois do fim) recusa', async () => {
    const code = deriveCheckInCode('booking-1');
    const early = setup('2026-11-10T08:59:00.000Z');
    await expect(early.service.checkInByCode(PARTNER, checkIn(code))).rejects.toMatchObject({
      code: 'CHECK_IN_WINDOW_CLOSED',
    });
    const late = setup('2026-11-11T01:01:00.000Z');
    await expect(late.service.checkInByCode(PARTNER, checkIn(code))).rejects.toMatchObject({
      code: 'CHECK_IN_WINDOW_CLOSED',
    });
  });

  it('check-in feito sem internet vale pela hora do aparelho e registra quando sincronizou', async () => {
    const { service } = setup('2026-11-10T15:00:00.000Z');
    const updated = await service.checkInByCode(
      PARTNER,
      checkIn(deriveCheckInCode('booking-1'), { capturedAt: '2026-11-10T11:02:00.000Z' })
    );
    expect(updated.checkIn).toMatchObject({
      at: '2026-11-10T11:02:00.000Z',
      syncedAt: '2026-11-10T15:00:00.000Z',
    });
  });

  it('recusa hora do aparelho no futuro ou com mais de 24 h', async () => {
    const { service } = setup('2026-11-10T15:00:00.000Z');
    const code = deriveCheckInCode('booking-1');
    await expect(
      service.checkInByCode(PARTNER, checkIn(code, { capturedAt: '2026-11-10T15:05:00.000Z' }))
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.checkInByCode(PARTNER, checkIn(code, { capturedAt: '2026-11-09T14:00:00.000Z' }))
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('presentes acima do número de pessoas da reserva é recusado', async () => {
    const { service } = setup();
    await expect(
      service.checkInByCode(
        PARTNER,
        checkIn(deriveCheckInCode('booking-2'), { participantsPresent: 2 })
      )
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('reserva cancelada não aceita check-in: o código não é encontrado', async () => {
    const { service, port } = setup();
    port.bookings.set('booking-1', booking('booking-1', { status: 'canceled' }));
    await expect(
      service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')))
    ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
  });

  it('hasCheckIn indica a prova do serviço', async () => {
    const { service } = setup();
    expect(await service.hasCheckIn('booking-1')).toBe(false);
    await service.checkInByCode(PARTNER, checkIn(deriveCheckInCode('booking-1')));
    expect(await service.hasCheckIn('booking-1')).toBe(true);
  });
});
