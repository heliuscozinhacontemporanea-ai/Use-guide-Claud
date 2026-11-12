import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableOffer, Booking } from '../types/bookingTypes';
import { BookingArrivalService } from './bookingArrivalService';

const STARTS_AT = '2026-11-10T12:00:00.000Z';
const PARTNER = { uid: 'partner-1', admin: false };

function offer(): BookableOffer {
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
  };
}

function booking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: `buyer-${id}`,
    sellerPartnerId: 'partner-1',
    kind: 'tour',
    status: 'confirmed',
    lines: [],
    participantsCount: 2,
    subtotalMinor: 1000,
    platformFeeMinor: 150,
    totalMinor: 1000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Buggy',
      startsAt: STARTS_AT,
      durationMinutes: 120,
      cancellationPolicy: 'moderate',
    },
    contactPhone: `+55889981234${id.length}0`,
    locale: 'pt-BR',
    idempotencyKey: id,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function setup(now = '2026-11-10T11:52:00.000Z') {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', offer());
  port.slots.set('slot-1', {
    id: 'slot-1',
    offerId: 'offer-1',
    startsAt: STARTS_AT,
    capacityTotal: 8,
    capacityReserved: 0,
    capacitySold: 6,
    status: 'open',
    createdAt: '',
    updatedAt: '',
  });
  port.bookings.set('a', booking('a'));
  port.bookings.set('bb', booking('bb'));
  port.bookings.set(
    'ccc',
    booking('ccc', { checkIns: [{ unit: 0, at: STARTS_AT, byUid: 'partner-1', method: 'code' }] })
  );
  let current = new Date(now);
  const service = new BookingArrivalService(port, () => current);
  return { port, service, setNow: (iso: string) => (current = new Date(iso)) };
}

describe('BookingArrivalService (D27)', () => {
  it('"Cheguei" do horário marca só quem ainda não chegou e mantém a primeira hora', async () => {
    const { service, port, setNow } = setup();
    const arrived = await service.recordSlotArrival(PARTNER, 'offer-1', 'slot-1');
    expect(arrived.map((item) => item.id).sort()).toEqual(['a', 'bb']);
    expect(port.bookings.get('ccc')?.arrival).toBeUndefined();
    setNow('2026-11-10T11:58:00.000Z');
    await service.recordSlotArrival(PARTNER, 'offer-1', 'slot-1');
    expect(port.bookings.get('a')?.arrival?.at).toBe('2026-11-10T11:52:00.000Z');
  });

  it('telefone só depois do "Cheguei", só de quem não usou o código, até o fim do horário', async () => {
    const { service, setNow } = setup();
    expect(await service.listSlotContacts(PARTNER, 'offer-1', 'slot-1')).toEqual([]);
    await service.recordSlotArrival(PARTNER, 'offer-1', 'slot-1');
    const contacts = await service.listSlotContacts(PARTNER, 'offer-1', 'slot-1');
    expect(contacts.map((item) => item.booking.id).sort()).toEqual(['a', 'bb']);
    setNow('2026-11-10T14:01:00.000Z');
    expect(await service.listSlotContacts(PARTNER, 'offer-1', 'slot-1')).toEqual([]);
  });

  it('outro parceiro não vê os contatos nem marca chegada', async () => {
    const { service } = setup();
    const other = { uid: 'partner-2', admin: false };
    await expect(service.listSlotContacts(other, 'offer-1', 'slot-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(service.recordSlotArrival(other, 'offer-1', 'slot-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('"Estou chegando" fica no contato; "Não vou mais" vira ausência e some dos contatos', async () => {
    const { service, port } = setup();
    await expect(
      service.respondToArrival({ uid: 'buyer-a', admin: false }, 'a', 'coming')
    ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
    await service.recordSlotArrival(PARTNER, 'offer-1', 'slot-1');
    await service.respondToArrival({ uid: 'buyer-a', admin: false }, 'a', 'coming');
    expect(port.bookings.get('a')?.arrivalResponse?.response).toBe('coming');
    const gone = await service.respondToArrival(
      { uid: 'buyer-bb', admin: false },
      'bb',
      'not_going'
    );
    expect(gone.status).toBe('no_show');
    const contacts = await service.listSlotContacts(PARTNER, 'offer-1', 'slot-1');
    expect(contacts.map((item) => item.booking.id)).toEqual(['a']);
    await expect(
      service.respondToArrival({ uid: 'buyer-a', admin: false }, 'bb', 'coming')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('"Iniciar serviço" grava o primeiro toque, registra a auditoria e não regrava (C4)', async () => {
    const { service, port, setNow } = setup('2026-11-10T12:04:00.000Z');
    const started = await service.startSlotService(PARTNER, 'offer-1', 'slot-1');
    expect(started.startedAt).toBe('2026-11-10T12:04:00.000Z');
    expect(port.slots.get('slot-1')?.startedByUid).toBe('partner-1');
    setNow('2026-11-10T12:30:00.000Z');
    const again = await service.startSlotService(PARTNER, 'offer-1', 'slot-1');
    expect(again.startedAt).toBe('2026-11-10T12:04:00.000Z');
  });

  it('"Iniciar serviço" exige check-in, a janela do horário e o dono (C4)', async () => {
    const { service, port, setNow } = setup('2026-11-10T09:59:00.000Z');
    const start = () => service.startSlotService(PARTNER, 'offer-1', 'slot-1');
    await expect(start()).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
    setNow('2026-11-10T14:00:00.000Z');
    await expect(start()).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
    setNow('2026-11-10T12:04:00.000Z');
    await expect(
      service.startSlotService({ uid: 'partner-2', admin: false }, 'offer-1', 'slot-1')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    port.bookings.set('ccc', booking('ccc'));
    await expect(start()).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
    expect(port.slots.get('slot-1')?.startedAt).toBeUndefined();
  });
});
