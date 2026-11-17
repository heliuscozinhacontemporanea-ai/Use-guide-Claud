import { describe, expect, it } from 'vitest';
import type { AvailabilitySlot, Booking } from '../types/bookingTypes';
import type { FleetDay } from '../types/fleetTypes';
import { canHoldAgain, holdFleetBooking, releaseFleetBooking, resizeFleetDay } from './fleetLedger';
import { rescheduleFleetHolds } from './fleetReschedule';

const NOW = '2026-11-17T12:00:00.000Z';

function day(overrides: Partial<FleetDay> = {}): FleetDay {
  return {
    id: 'offer-1__2026-11-21',
    offerId: 'offer-1',
    date: '2026-11-21',
    vehicles: 2,
    holds: [],
    slotIndex: {},
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function booking(id: string, startsAt: string, hours: number, units = 1): Booking {
  const endsAt = new Date(Date.parse(startsAt) + hours * 3_600_000).toISOString();
  return {
    id,
    offerId: 'offer-1',
    slotId: '',
    participantsCount: units,
    status: 'pending_payment',
    offerSnapshot: { title: 'Quadriciclo', startsAt, durationMinutes: hours * 60 },
    fleet: { dayId: 'offer-1__2026-11-21', startsAt, endsAt },
  } as unknown as Booking;
}

describe('holdFleetBooking', () => {
  it('ocupa o veículo e cria o horário de serviço; o mesmo início e fim reaproveita o horário', () => {
    const first = holdFleetBooking({
      day: day(),
      booking: booking('a', '2026-11-21T11:00:00.000Z', 4),
      existingSlot: null,
      newSlotId: 'slot-1',
      now: NOW,
    });
    expect(first.slot).toMatchObject({ id: 'slot-1', capacityReserved: 1, fleetDayId: day().id });
    expect(first.day.holds).toHaveLength(1);
    const second = holdFleetBooking({
      day: first.day,
      booking: booking('b', '2026-11-21T11:00:00.000Z', 4),
      existingSlot: first.slot,
      newSlotId: 'slot-2',
      now: NOW,
    });
    expect(second.slot).toMatchObject({ id: 'slot-1', capacityReserved: 2 });
  });

  it('recusa sem veículo livre em algum momento do intervalo e com o dia fechado', () => {
    const busy = day({
      vehicles: 1,
      holds: [
        {
          bookingId: 'x',
          startsAt: '2026-11-21T13:00:00.000Z',
          endsAt: '2026-11-21T14:00:00.000Z',
          units: 1,
        },
      ],
    });
    const attempt = (target: FleetDay | null) =>
      holdFleetBooking({
        day: target,
        booking: booking('a', '2026-11-21T11:00:00.000Z', 4),
        existingSlot: null,
        newSlotId: 'slot-1',
        now: NOW,
      });
    expect(() => attempt(busy)).toThrow(expect.objectContaining({ code: 'INSUFFICIENT_CAPACITY' }));
    expect(() => attempt(day({ vehicles: 0 }))).toThrow(
      expect.objectContaining({ code: 'SLOT_UNAVAILABLE' })
    );
    expect(() => attempt(null)).toThrow(expect.objectContaining({ code: 'SLOT_UNAVAILABLE' }));
  });
});

describe('liberar, redimensionar e pagar depois de expirar', () => {
  const held = day({
    vehicles: 2,
    holds: [
      {
        bookingId: 'a',
        startsAt: '2026-11-21T11:00:00.000Z',
        endsAt: '2026-11-21T15:00:00.000Z',
        units: 1,
      },
      {
        bookingId: 'b',
        startsAt: '2026-11-21T12:00:00.000Z',
        endsAt: '2026-11-21T13:00:00.000Z',
        units: 1,
      },
    ],
  });

  it('liberar devolve o veículo; o dia não baixa do pico reservado', () => {
    expect(releaseFleetBooking(held, 'a', NOW).holds.map((hold) => hold.bookingId)).toEqual(['b']);
    expect(() => resizeFleetDay(held, 1, NOW)).toThrow(
      expect.objectContaining({ code: 'VEHICLES_BELOW_BOOKED' })
    );
    expect(resizeFleetDay(held, 3, NOW).vehicles).toBe(3);
    expect(resizeFleetDay(day(), 0, NOW).vehicles).toBe(0);
  });

  it('pagamento atrasado só volta a valer se o veículo ainda estiver livre', () => {
    const late = booking('c', '2026-11-21T12:30:00.000Z', 1);
    expect(canHoldAgain(held, late)).toBe(false);
    expect(canHoldAgain(held, booking('d', '2026-11-21T16:00:00.000Z', 1))).toBe(true);
  });
});

describe('rescheduleFleetHolds', () => {
  const slot: AvailabilitySlot = {
    id: 'slot-1',
    offerId: 'offer-1',
    startsAt: '2026-11-21T11:00:00.000Z',
    endsAt: '2026-11-21T15:00:00.000Z',
    capacityTotal: 2,
    capacityReserved: 0,
    capacitySold: 1,
    status: 'open',
    fleetDayId: 'offer-1__2026-11-21',
    createdAt: NOW,
    updatedAt: NOW,
  };
  const moving = booking('a', '2026-11-21T11:00:00.000Z', 4);
  const current = day({
    holds: [
      {
        bookingId: 'a',
        startsAt: '2026-11-21T11:00:00.000Z',
        endsAt: '2026-11-21T15:00:00.000Z',
        units: 1,
      },
    ],
    slotIndex: { '2026-11-21T11:00:00.000Z|2026-11-21T15:00:00.000Z': 'slot-1' },
  });

  it('muda de dia levando a ocupação; sem o novo dia aberto, recusa', () => {
    const next = day({ id: 'offer-1__2026-11-22', date: '2026-11-22' });
    const days = new Map([
      [current.id, current],
      [next.id, next],
    ]);
    const plan = rescheduleFleetHolds({
      slot,
      bookings: [moving],
      startsAt: '2026-11-22T11:00:00.000Z',
      timeZone: 'America/Fortaleza',
      days: (id) => days.get(id) ?? null,
      now: NOW,
    });
    expect(plan.slot).toMatchObject({ fleetDayId: next.id, endsAt: '2026-11-22T15:00:00.000Z' });
    expect(plan.days.find((entry) => entry.id === current.id)?.holds).toEqual([]);
    expect(plan.days.find((entry) => entry.id === next.id)?.holds[0]?.startsAt).toBe(
      '2026-11-22T11:00:00.000Z'
    );
    expect(plan.bookings[0]?.fleet?.dayId).toBe(next.id);
    expect(() =>
      rescheduleFleetHolds({
        slot,
        bookings: [moving],
        startsAt: '2026-11-23T11:00:00.000Z',
        timeZone: 'America/Fortaleza',
        days: (id) => days.get(id) ?? null,
        now: NOW,
      })
    ).toThrow(expect.objectContaining({ code: 'SLOT_UNAVAILABLE' }));
  });
});
