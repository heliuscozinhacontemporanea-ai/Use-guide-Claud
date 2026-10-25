import { describe, expect, it } from 'vitest';
import { canTransitionBooking } from '../types/bookingTypes';
import { priceBookingLines } from './bookingPricing';
import { buildBookingId, buildSlotId } from './buildBookingId';
import { expandSlotRecurrence, fortalezaLocalToUtcIso } from './slotRecurrence';

const FEES = {
  bookingsBps: 1000,
  ticketsBps: 1000,
  ticketsAbsorbedBps: 1250,
  ticketServiceFeeMinor: 300,
};

const OFFER = {
  maxParticipantsPerBooking: 6,
  pricing: {
    currency: 'BRL' as const,
    priceOptions: [
      { id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15090 },
      { id: 'child', label: { 'pt-BR': 'Criança' }, unitAmountMinor: 7545, maxQuantity: 2 },
    ],
  },
};

describe('priceBookingLines', () => {
  it('soma em centavos e calcula a taxa pela configuração', () => {
    const priced = priceBookingLines(
      OFFER,
      [
        { priceOptionId: 'adult', quantity: 2 },
        { priceOptionId: 'child', quantity: 1 },
      ],
      FEES
    );
    expect(priced.subtotalMinor).toBe(37725);
    expect(priced.totalMinor).toBe(37725);
    // Arredonda a favor do proprietário (D14).
    expect(priced.platformFeeMinor).toBe(3772);
    expect(priced.participantsCount).toBe(3);
  });

  it('recusa opção inexistente, repetida, quantidade fora do limite e excesso de participantes', () => {
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'vip', quantity: 1 }], FEES)).toThrow(
      'Opção'
    );
    expect(() =>
      priceBookingLines(
        OFFER,
        [
          { priceOptionId: 'adult', quantity: 1 },
          { priceOptionId: 'adult', quantity: 1 },
        ],
        FEES
      )
    ).toThrow('repetida');
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'child', quantity: 3 }], FEES)).toThrow(
      'acima'
    );
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 0 }], FEES)).toThrow(
      'inválida'
    );
    expect(() =>
      priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 1.5 }], FEES)
    ).toThrow('inválida');
    expect(() => priceBookingLines(OFFER, [{ priceOptionId: 'adult', quantity: 7 }], FEES)).toThrow(
      'limite'
    );
    expect(() => priceBookingLines(OFFER, [], FEES)).toThrow('ao menos');
  });
});

describe('canTransitionBooking', () => {
  it('segue a máquina de estados do desenho', () => {
    expect(canTransitionBooking('pending_payment', 'confirmed')).toBe(true);
    expect(canTransitionBooking('confirmed', 'canceled')).toBe(true);
    expect(canTransitionBooking('canceled', 'refunded')).toBe(true);
    expect(canTransitionBooking('expired', 'confirmed')).toBe(false);
    expect(canTransitionBooking('refunded', 'confirmed')).toBe(false);
    expect(canTransitionBooking('pending_payment', 'refunded')).toBe(false);
  });
});

describe('recorrência e IDs', () => {
  it('08:00 em Fortaleza = 11:00Z', () => {
    expect(fortalezaLocalToUtcIso('2026-11-02', '08:00')).toBe('2026-11-02T11:00:00.000Z');
    expect(fortalezaLocalToUtcIso('2026-11-02', '22:30')).toBe('2026-11-03T01:30:00.000Z');
  });

  it('gera só os dias da semana pedidos', () => {
    // 2026-11-02 é segunda-feira.
    const slots = expandSlotRecurrence({
      startDate: '2026-11-02',
      endDate: '2026-11-08',
      weekdays: [1, 3],
      times: ['08:00', '14:00'],
    });
    expect(slots).toEqual([
      '2026-11-02T11:00:00.000Z',
      '2026-11-02T17:00:00.000Z',
      '2026-11-04T11:00:00.000Z',
      '2026-11-04T17:00:00.000Z',
    ]);
  });

  it('recusa período invertido e horário inválido', () => {
    expect(() =>
      expandSlotRecurrence({
        startDate: '2026-11-08',
        endDate: '2026-11-02',
        weekdays: [1],
        times: ['08:00'],
      })
    ).toThrow();
    expect(() => fortalezaLocalToUtcIso('2026-11-02', '25:00')).toThrow();
  });

  it('IDs determinísticos', () => {
    expect(buildBookingId('u1', 'key-12345')).toBe(buildBookingId('u1', 'key-12345'));
    expect(buildBookingId('u1', 'key-12345')).not.toBe(buildBookingId('u2', 'key-12345'));
    expect(buildBookingId('u1', 'key-12345')).toMatch(/^bk_[0-9a-f]{32}$/);
    expect(buildSlotId('offer_1', '2026-11-02T11:00:00.000Z')).toBe('offer_1_1793617200');
  });
});
