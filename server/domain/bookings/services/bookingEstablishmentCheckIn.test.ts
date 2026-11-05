import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { AvailabilitySlot, BookableOffer, Booking } from '../types/bookingTypes';
import { deriveCheckInCode } from '../utils/checkInCode';
import { BookingCheckInService, establishmentFailureScope } from './bookingCheckInService';

const PARTNER = { uid: 'partner-1', admin: false };
const NOW = '2026-11-10T12:00:00.000Z';

function offer(id: string, overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id,
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'tour',
    title: { 'pt-BR': `Oferta ${id}` },
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

function slot(id: string, offerId: string, startsAt: string): AvailabilitySlot {
  return {
    id,
    offerId,
    startsAt,
    capacityTotal: 4,
    capacityReserved: 0,
    capacitySold: 4,
    status: 'open',
    createdAt: '',
    updatedAt: '',
  };
}

function booking(id: string, offerId: string, slotId: string, startsAt: string): Booking {
  return {
    id,
    offerId,
    slotId,
    guideItemId: 'item-1',
    buyerId: `buyer-${id}`,
    sellerPartnerId: 'partner-1',
    kind: 'rental',
    status: 'confirmed',
    lines: [],
    participantsCount: 2,
    subtotalMinor: 1000,
    platformFeeMinor: 150,
    totalMinor: 1000,
    expiresAt: null,
    offerSnapshot: { title: 'x', startsAt, durationMinutes: 120, cancellationPolicy: 'moderate' },
    locale: 'pt-BR',
    idempotencyKey: id,
    createdAt: '',
    updatedAt: '',
  };
}

function setup() {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('passeio', offer('passeio'));
  port.offers.set('aluguel', offer('aluguel', { kind: 'rental' }));
  port.offers.set('outro-item', offer('outro-item', { guideItemId: 'item-2' }));
  port.offers.set('de-outro', offer('de-outro', { ownerId: 'partner-2', partnerId: 'partner-2' }));
  port.slots.set('s-passeio', slot('s-passeio', 'passeio', '2026-11-10T12:00:00.000Z'));
  port.slots.set('s-aluguel', slot('s-aluguel', 'aluguel', '2026-11-10T12:30:00.000Z'));
  // Amanhã: check-in ainda fechado.
  port.slots.set('s-amanha', slot('s-amanha', 'passeio', '2026-11-11T12:00:00.000Z'));
  port.bookings.set('b1', booking('b1', 'passeio', 's-passeio', '2026-11-10T12:00:00.000Z'));
  port.bookings.set('b2', booking('b2', 'aluguel', 's-aluguel', '2026-11-10T12:30:00.000Z'));
  port.bookings.set('b3', booking('b3', 'passeio', 's-amanha', '2026-11-11T12:00:00.000Z'));
  const service = new BookingCheckInService(port, () => new Date(NOW));
  return { port, service };
}

const input = (code: string) => ({ guideItemId: 'item-1', code });

describe('checkInByEstablishmentCode (D27)', () => {
  beforeEach(() => {
    process.env.BOOKING_CHECKIN_CODE_SECRET = 's'.repeat(32);
  });
  afterEach(() => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
  });

  it('acha o código em qualquer horário aberto do estabelecimento e diz quantos já entraram', async () => {
    const { service } = setup();
    const result = await service.checkInByEstablishmentCode(
      PARTNER,
      input(deriveCheckInCode('b2', undefined, 1))
    );
    expect(result).toMatchObject({
      unit: 1,
      alreadyCheckedIn: false,
      offer: { id: 'aluguel', kind: 'rental' },
      slot: { id: 's-aluguel' },
      delivered: { checkedIn: 1, total: 2 },
    });
    const again = await service.checkInByEstablishmentCode(
      PARTNER,
      input(deriveCheckInCode('b1', undefined, 0))
    );
    expect(again.slot.id).toBe('s-passeio');
  });

  it('código de horário fechado não vale e conta como erro do estabelecimento', async () => {
    const { service, port } = setup();
    await expect(
      service.checkInByEstablishmentCode(PARTNER, input(deriveCheckInCode('b3', undefined, 0)))
    ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
    expect(await port.countCheckInFailures(establishmentFailureScope('item-1'), '2026-01-01')).toBe(
      1
    );
  });

  it('limite: 5 erros por horário aberto (2 horários = 10), com teto de 20', async () => {
    const { service } = setup();
    for (let i = 0; i < 10; i++) {
      await expect(
        service.checkInByEstablishmentCode(PARTNER, input('ZZZZZZ'))
      ).rejects.toMatchObject({ code: 'INVALID_CHECK_IN_CODE' });
    }
    await expect(
      service.checkInByEstablishmentCode(PARTNER, input(deriveCheckInCode('b1', undefined, 0)))
    ).rejects.toMatchObject({ code: 'CHECK_IN_LOCKED' });
  });

  it('item de outro dono responde como inexistente; sem horário aberto, janela fechada', async () => {
    const { service, port } = setup();
    await expect(
      service.checkInByEstablishmentCode({ uid: 'partner-3', admin: false }, input('ABCDEF'))
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    port.slots.delete('s-passeio');
    port.slots.delete('s-aluguel');
    await expect(
      service.checkInByEstablishmentCode(PARTNER, input('ABCDEF'))
    ).rejects.toMatchObject({ code: 'CHECK_IN_WINDOW_CLOSED' });
  });
});
