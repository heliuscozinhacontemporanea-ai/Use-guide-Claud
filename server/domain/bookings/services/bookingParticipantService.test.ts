import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { Booking } from '../types/bookingTypes';
import { BookingParticipantService } from './bookingParticipantService';

const BUYER = { uid: 'buyer-1', admin: false };

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'bk_1',
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'private_entry',
    status: 'confirmed',
    lines: [],
    participantsCount: 2,
    subtotalMinor: 6000,
    platformFeeMinor: 900,
    totalMinor: 6000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Lagoa privada',
      startsAt: '2026-11-10T12:00:00.000Z',
      cancellationPolicy: 'moderate',
      requiresParticipantNames: true,
    },
    locale: 'pt-BR',
    idempotencyKey: 'key-1',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function setup(now = '2026-11-08T12:00:00.000Z', overrides: Partial<Booking> = {}) {
  const port = new InMemoryBookingsAdapter();
  port.bookings.set('bk_1', booking(overrides));
  return { port, service: new BookingParticipantService(port, () => new Date(now)) };
}

describe('BookingParticipantService (D20)', () => {
  it('o cliente informa o nome depois da compra e troca uma vez até 24 h antes', async () => {
    const { service, port } = setup();
    await service.setName(BUYER, 'bk_1', 1, '  Bruno Lima ');
    expect(port.participants.get('bk_1')?.[1]).toEqual({
      name: 'Bruno Lima',
      isLeadContact: false,
    });
    const changed = await service.setName(BUYER, 'bk_1', 1, 'Carla Dias');
    expect(changed).toMatchObject({
      name: 'Carla Dias',
      nameChangedAt: '2026-11-08T12:00:00.000Z',
    });
    await expect(service.setName(BUYER, 'bk_1', 1, 'Daniel Reis')).rejects.toMatchObject({
      code: 'NAME_CHANGE_NOT_ALLOWED',
    });
  });

  it('a troca fecha 24 h antes, mas o primeiro nome pode ser dado até o dia', async () => {
    const { service } = setup('2026-11-09T13:00:00.000Z');
    await service.setName(BUYER, 'bk_1', 0, 'Ana Souza');
    await expect(service.setName(BUYER, 'bk_1', 0, 'Ana Lima')).rejects.toMatchObject({
      code: 'NAME_CHANGE_NOT_ALLOWED',
    });
  });

  it('outra pessoa, oferta sem nomes, unidade inexistente ou já usada são recusadas', async () => {
    const { service } = setup();
    await expect(
      service.setName({ uid: 'intruso', admin: false }, 'bk_1', 0, 'Ana Souza')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.setName(BUYER, 'bk_1', 5, 'Ana Souza')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const noNames = setup(undefined, {
      offerSnapshot: {
        title: 'x',
        startsAt: '2026-11-10T12:00:00.000Z',
        cancellationPolicy: 'moderate',
      },
    });
    await expect(noNames.service.setName(BUYER, 'bk_1', 0, 'Ana Souza')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    const used = setup(undefined, {
      checkIns: [{ unit: 0, at: 't', byUid: 'p', method: 'qr' }],
    });
    await expect(used.service.setName(BUYER, 'bk_1', 0, 'Ana Souza')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
  });
});
