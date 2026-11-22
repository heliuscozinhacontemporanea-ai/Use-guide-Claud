import { describe, expect, it } from 'vitest';
import type { BookableItem } from '../ports/bookableItemLookupPort';
import { assertKindFields, normalizeFleet } from './fleetOfferRules';
import { datesBetween, freeUnits, peakUnits, placeMinuteIso, weekdayOf } from './fleetTime';

const ITEM: BookableItem = {
  id: 'item-1',
  ownerId: 'o',
  partnerId: 'o',
  category: 'rental',
  name: 'Quadri Jeri',
  published: true,
  vehicleTypes: ['Quadriciclo'],
  transferRoutes: [{ from: 'Jericoacoara', to: 'Aeroporto de Jeri' }],
};

const price = (id: string, unitAmountMinor = 10000) => ({
  id,
  label: { 'pt-BR': id },
  unitAmountMinor,
});

describe('assertKindFields · aluguel', () => {
  const rental = {
    vehicle: 'Quadriciclo',
    sellingUnit: 'group' as const,
    groupMaxPeople: 2,
    pricing: { currency: 'BRL' as const, priceOptions: [price('p1'), price('hourly', 8000)] },
    fleet: {
      fixed: [{ id: 'p1', start: '08:00', minutes: 240 }],
      custom: { mode: 'hours' as const, minHours: 2 },
    },
  };

  it('aceita período com preço e horário personalizado com preço por hora', () => {
    expect(() => assertKindFields('rental', rental, ITEM)).not.toThrow();
  });

  it('recusa veículo fora do anúncio, período sem preço e período que passa da meia-noite', () => {
    expect(() => assertKindFields('rental', { ...rental, vehicle: 'Buggy' }, ITEM)).toThrow();
    expect(() =>
      assertKindFields(
        'rental',
        { ...rental, pricing: { currency: 'BRL', priceOptions: [price('p1')] } },
        ITEM
      )
    ).toThrow();
    expect(() =>
      assertKindFields(
        'rental',
        { ...rental, fleet: { fixed: [{ id: 'p1', start: '22:00', minutes: 240 }] } },
        ITEM
      )
    ).toThrow();
  });
});

describe('assertKindFields · translado', () => {
  const route = { from: 'Jericoacoara', to: 'Aeroporto de Jeri' };
  const privateTransfer = {
    route,
    durationMinutes: 40,
    sellingUnit: 'group' as const,
    groupMaxPeople: 4,
    pricing: { currency: 'BRL' as const, priceOptions: [price('vehicle', 25000)] },
    fleet: {
      fixed: [{ id: 'd1', start: '06:00', minutes: 0 }],
      custom: { mode: 'time' as const, from: '05:00', to: '23:00', minNoticeHours: 12 },
    },
  };

  it('privativo: trecho do anúncio, saídas e atendimento; cada saída dura o tempo de viagem', () => {
    expect(() => assertKindFields('transfer', privateTransfer, ITEM)).not.toThrow();
    expect(normalizeFleet('transfer', privateTransfer)?.fixed[0]?.minutes).toBe(40);
  });

  it('recusa trecho fora do anúncio, atendimento invertido e compartilhado com dias de veículos', () => {
    expect(() =>
      assertKindFields(
        'transfer',
        { ...privateTransfer, route: { ...route, to: 'Fortaleza' } },
        ITEM
      )
    ).toThrow();
    expect(() =>
      assertKindFields(
        'transfer',
        {
          ...privateTransfer,
          fleet: {
            fixed: [],
            custom: { mode: 'time', from: '23:00', to: '05:00', minNoticeHours: 12 },
          },
        },
        ITEM
      )
    ).toThrow();
    expect(() =>
      assertKindFields('transfer', { ...privateTransfer, sellingUnit: 'person' }, ITEM)
    ).toThrow();
  });
});

describe('fleetTime', () => {
  const holds = [
    {
      bookingId: 'a',
      startsAt: '2026-11-21T11:00:00.000Z',
      endsAt: '2026-11-21T15:00:00.000Z',
      units: 1,
    },
    {
      bookingId: 'b',
      startsAt: '2026-11-21T14:00:00.000Z',
      endsAt: '2026-11-21T17:00:00.000Z',
      units: 1,
    },
  ];

  it('pico de ocupação dentro do intervalo e veículos livres (sem a reserva remarcada)', () => {
    expect(peakUnits(holds, '2026-11-21T10:00:00.000Z', '2026-11-21T18:00:00.000Z')).toBe(2);
    expect(peakUnits(holds, '2026-11-21T15:00:00.000Z', '2026-11-21T16:00:00.000Z')).toBe(1);
    expect(
      freeUnits({ vehicles: 2, holds }, '2026-11-21T14:30:00.000Z', '2026-11-21T14:45:00.000Z')
    ).toBe(0);
    expect(
      freeUnits(
        { vehicles: 2, holds },
        '2026-11-21T14:30:00.000Z',
        '2026-11-21T14:45:00.000Z',
        new Set(['a'])
      )
    ).toBe(1);
  });

  it('datas, dia da semana e hora do lugar', () => {
    expect(weekdayOf('2026-11-21')).toBe(6);
    expect(datesBetween('2026-11-20', '2026-11-23', [0, 6], 10)).toEqual([
      '2026-11-21',
      '2026-11-22',
    ]);
    // 08:00 em Fortaleza (UTC−3) = 11:00Z.
    expect(placeMinuteIso('2026-11-21', 8 * 60, 'America/Fortaleza')).toBe(
      '2026-11-21T11:00:00.000Z'
    );
  });
});
