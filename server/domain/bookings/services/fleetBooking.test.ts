import { describe, expect, it, vi } from 'vitest';
import { BUYER_TERMS_VERSION } from '../../../shared/kernel/legalTerms';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableItem } from '../ports/bookableItemLookupPort';
import type { BookableOffer } from '../types/bookingTypes';
import { BookingService, type CreatePendingBookingInput } from './bookingService';
import { FleetService } from './fleetService';

vi.mock('../../promotions', () => ({
  computePromoDiscount: vi.fn(),
  getPromoCodeForCheckoutUseCase: vi.fn(),
  reservePromoUseUseCase: vi.fn(),
  releasePromoUseUseCase: vi.fn().mockResolvedValue(undefined),
}));

const BUYER = { uid: 'buyer-1', admin: false };
const OWNER = { uid: 'partner-1', admin: false };
const FEES = {
  bookingsBps: 1500,
  ticketsBps: 1000,
  ticketsAbsorbedBps: 1250,
  ticketServiceFeeMinor: 300,
};
// Fortaleza (UTC−3): 08:00 local = 11:00Z.
const TZ = 'America/Fortaleza';
const DAY = '2026-11-21';

function rentalOffer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-r',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'rental',
    title: { 'pt-BR': 'Quadriciclo' },
    status: 'published',
    vehicle: 'Quadriciclo',
    sellingUnit: 'group',
    groupMaxPeople: 2,
    requiresDriverLicense: true,
    pricing: {
      currency: 'BRL',
      priceOptions: [
        { id: 'manha', label: { 'pt-BR': '08:00 · 4 h' }, unitAmountMinor: 30000 },
        { id: 'hourly', label: { 'pt-BR': 'Por hora' }, unitAmountMinor: 8000 },
      ],
    },
    fleet: {
      fixed: [{ id: 'manha', start: '08:00', minutes: 240 }],
      custom: { mode: 'hours', minHours: 2 },
    },
    timeZone: TZ,
    cancellationPolicy: 'moderate',
    maxParticipantsPerBooking: 3,
    requiresParticipantNames: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function transferOffer(): BookableOffer {
  return {
    ...rentalOffer(),
    id: 'offer-t',
    kind: 'transfer',
    title: { 'pt-BR': 'Jeri → Aeroporto' },
    vehicle: undefined,
    requiresDriverLicense: undefined,
    route: { from: 'Jericoacoara', to: 'Aeroporto de Jeri' },
    groupMaxPeople: 4,
    durationMinutes: 60,
    pricing: {
      currency: 'BRL',
      priceOptions: [{ id: 'vehicle', label: { 'pt-BR': 'Veículo' }, unitAmountMinor: 25000 }],
    },
    fleet: {
      fixed: [{ id: 'cedo', start: '06:00', minutes: 60 }],
      custom: { mode: 'time', from: '05:00', to: '23:00', minNoticeHours: 12 },
    },
    cancellationPolicy: 'transfer_flexible',
  } as BookableOffer;
}

const ITEM: BookableItem = {
  id: 'item-1',
  ownerId: 'partner-1',
  partnerId: 'partner-1',
  category: 'rental',
  name: 'Quadri Jeri',
  published: true,
  timeZone: TZ,
  // Sábado (6): 08:00–18:00; domingo fechado.
  openingHours: [null, null, null, null, null, null, { open: '08:00', close: '18:00' }],
};

function setup(item: Partial<BookableItem> = {}) {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-r', rentalOffer());
  port.offers.set('offer-t', transferOffer());
  const items = { getItem: async () => ({ ...ITEM, ...item }) };
  let now = new Date('2026-11-17T12:00:00.000Z');
  const clock = () => now;
  return {
    port,
    fleet: new FleetService(port, items, clock),
    bookings: new BookingService(port, items, clock),
    setNow: (iso: string) => {
      now = new Date(iso);
    },
  };
}

const BASE: Omit<CreatePendingBookingInput, 'lines' | 'idempotencyKey'> = {
  offerId: 'offer-r',
  participants: [],
  locale: 'pt-BR',
  acceptedTermsVersion: BUYER_TERMS_VERSION,
  contactPhone: '+5588998123456',
  driverLicenseDeclared: true,
};

describe('FleetService · abrir dias', () => {
  it('aluguel: abre só os dias em que o anúncio funciona, com o horário dele', async () => {
    const { fleet } = setup();
    const days = await fleet.openDays(OWNER, 'offer-r', {
      startDate: '2026-11-21',
      endDate: '2026-11-22',
      weekdays: [0, 6],
      vehicles: 3,
    });
    expect(days).toEqual([
      expect.objectContaining({
        date: DAY,
        vehicles: 3,
        opensAt: '2026-11-21T11:00:00.000Z',
        closesAt: '2026-11-21T21:00:00.000Z',
      }),
    ]);
  });

  it('não baixa os veículos abaixo do reservado; oferta de outro dono não existe', async () => {
    const { fleet, bookings } = setup();
    await fleet.openDays(OWNER, 'offer-r', {
      startDate: DAY,
      endDate: DAY,
      weekdays: [6],
      vehicles: 2,
    });
    await bookings.createPendingBooking(
      BUYER,
      {
        ...BASE,
        fleet: { date: DAY, periodId: 'manha' },
        lines: [{ priceOptionId: 'manha', quantity: 2 }],
        idempotencyKey: 'k-0000001',
      },
      FEES
    );
    await expect(
      fleet.openDays(OWNER, 'offer-r', { startDate: DAY, endDate: DAY, weekdays: [6], vehicles: 1 })
    ).rejects.toMatchObject({ code: 'VEHICLES_BELOW_BOOKED' });
    await expect(
      fleet.listDays({ uid: 'outro', admin: false }, 'offer-r', DAY, DAY)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('Reserva por veículo (F3b)', () => {
  it('período fixo ocupa o veículo; sem veículo livre na mesma hora, recusa', async () => {
    const { fleet, bookings, port } = setup();
    await fleet.openDays(OWNER, 'offer-r', {
      startDate: DAY,
      endDate: DAY,
      weekdays: [6],
      vehicles: 1,
    });
    const booking = await bookings.createPendingBooking(
      BUYER,
      {
        ...BASE,
        fleet: { date: DAY, periodId: 'manha' },
        lines: [{ priceOptionId: 'manha', quantity: 1 }],
        idempotencyKey: 'k-0000002',
      },
      FEES
    );
    expect(booking).toMatchObject({
      subtotalMinor: 30000,
      offerSnapshot: { startsAt: '2026-11-21T11:00:00.000Z', durationMinutes: 240 },
      fleet: { startsAt: '2026-11-21T11:00:00.000Z', endsAt: '2026-11-21T15:00:00.000Z' },
      driverLicenseDeclaredAt: expect.any(String),
    });
    expect(port.slots.get(booking.slotId)).toMatchObject({ endsAt: '2026-11-21T15:00:00.000Z' });
    // Por horas, das 10:00 às 12:00, cruza o período da manhã: o único veículo está ocupado.
    await expect(
      bookings.createPendingBooking(
        BUYER,
        {
          ...BASE,
          fleet: { date: DAY, startsAt: '2026-11-21T13:00:00.000Z', hours: 2 },
          lines: [{ priceOptionId: 'hourly', quantity: 1 }],
          idempotencyKey: 'k-0000003',
        },
        FEES
      )
    ).rejects.toMatchObject({ code: 'INSUFFICIENT_CAPACITY' });
    const day = await fleet.publicDay('offer-r', DAY);
    expect(day.fixed).toEqual([expect.objectContaining({ id: 'manha', available: 0 })]);
  });

  it('por horas: preço = horas × valor; fora do horário, abaixo do mínimo ou sem CNH, recusa', async () => {
    const { fleet, bookings } = setup();
    await fleet.openDays(OWNER, 'offer-r', {
      startDate: DAY,
      endDate: DAY,
      weekdays: [6],
      vehicles: 2,
    });
    const hourly = (
      startsAt: string,
      hours: number,
      extra: Partial<CreatePendingBookingInput> = {}
    ) =>
      bookings.createPendingBooking(
        BUYER,
        {
          ...BASE,
          fleet: { date: DAY, startsAt, hours },
          lines: [{ priceOptionId: 'hourly', quantity: 1 }],
          idempotencyKey: `k-${startsAt}-${hours}`,
          ...extra,
        },
        FEES
      );
    await expect(hourly('2026-11-21T16:00:00.000Z', 3)).resolves.toMatchObject({
      subtotalMinor: 24000,
    });
    // Devolução às 19:00, depois do fechamento (18:00).
    await expect(hourly('2026-11-21T19:00:00.000Z', 3)).rejects.toMatchObject({
      code: 'SLOT_UNAVAILABLE',
    });
    await expect(hourly('2026-11-21T16:00:00.000Z', 1)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    });
    await expect(
      hourly('2026-11-21T12:00:00.000Z', 2, { driverLicenseDeclared: false })
    ).rejects.toMatchObject({ code: 'DRIVER_LICENSE_REQUIRED' });
  });

  it('translado escolhido: ida e volta ocupam o veículo; respeita a antecedência', async () => {
    const { fleet, bookings, setNow } = setup();
    await fleet.openDays(OWNER, 'offer-t', {
      startDate: DAY,
      endDate: DAY,
      weekdays: [6],
      vehicles: 1,
    });
    const transfer = (startsAt: string, key: string) =>
      bookings.createPendingBooking(
        BUYER,
        {
          ...BASE,
          offerId: 'offer-t',
          driverLicenseDeclared: undefined,
          pickupAddress: 'Pousada Vila Kalango',
          fleet: { date: DAY, startsAt },
          lines: [{ priceOptionId: 'vehicle', quantity: 1 }],
          idempotencyKey: key,
        },
        FEES
      );
    const booking = await transfer('2026-11-21T13:00:00.000Z', 'k-t000001');
    expect(booking.fleet).toMatchObject({ endsAt: '2026-11-21T15:00:00.000Z' });
    // 11:30 local: o veículo ainda está voltando (ida e volta até 12:00).
    await expect(transfer('2026-11-21T14:30:00.000Z', 'k-t000002')).rejects.toMatchObject({
      code: 'INSUFFICIENT_CAPACITY',
    });
    // Menos de 12 h antes: recusa.
    setNow('2026-11-21T08:00:00.000Z');
    await expect(transfer('2026-11-21T18:00:00.000Z', 'k-t000003')).rejects.toMatchObject({
      code: 'SLOT_UNAVAILABLE',
    });
  });

  it('expirar devolve o veículo; anúncio em rascunho não vende', async () => {
    const { fleet, bookings, setNow } = setup();
    await fleet.openDays(OWNER, 'offer-r', {
      startDate: DAY,
      endDate: DAY,
      weekdays: [6],
      vehicles: 1,
    });
    const input = {
      ...BASE,
      fleet: { date: DAY, periodId: 'manha' },
      lines: [{ priceOptionId: 'manha', quantity: 1 }],
    };
    await bookings.createPendingBooking(BUYER, { ...input, idempotencyKey: 'k-e000001' }, FEES);
    setNow('2026-11-17T12:20:00.000Z');
    await bookings.expireOverdueBookings();
    expect((await fleet.publicDay('offer-r', DAY)).fixed[0]?.available).toBe(1);

    const draft = setup({ published: false });
    await draft.fleet.openDays(OWNER, 'offer-r', {
      startDate: DAY,
      endDate: DAY,
      weekdays: [6],
      vehicles: 1,
    });
    await expect(
      draft.bookings.createPendingBooking(BUYER, { ...input, idempotencyKey: 'k-e000002' }, FEES)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
