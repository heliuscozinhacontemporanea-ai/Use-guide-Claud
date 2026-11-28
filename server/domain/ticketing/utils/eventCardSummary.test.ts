import { describe, expect, it } from 'vitest';
import type { TicketType } from '../types/ticketingTypes';
import { eventCardSummary } from './eventCardSummary';

const NOW = Date.parse('2026-12-01T12:00:00.000Z');

const type = (id: string, patch: Partial<TicketType>): TicketType =>
  ({
    id,
    occurrenceId: 'o1',
    name: id,
    kind: 'paid',
    priceMinor: 4000,
    currency: 'BRL',
    quantity: 100,
    soldCount: 0,
    reservedCount: 0,
    minPerOrder: 1,
    maxPerOrder: 10,
    status: 'on_sale',
    visibility: 'public',
    sortOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...patch,
  }) as TicketType;

const occurrences = [
  { id: 'o1', startsAt: '2026-12-12T00:00:00.000Z', status: 'scheduled' },
  { id: 'passada', startsAt: '2026-11-20T00:00:00.000Z', status: 'scheduled' },
];

function summary(
  types: TicketType[],
  serviceFeeMode: 'pass_to_buyer' | 'absorb' = 'pass_to_buyer'
) {
  return eventCardSummary({
    occurrences,
    typesByOccurrence: new Map([
      ['o1', types.filter((t) => t.occurrenceId === 'o1')],
      ['passada', types.filter((t) => t.occurrenceId === 'passada')],
    ]),
    serviceFeeMode,
    cancellationPolicy: 'flexible',
    ticketServiceFeeMinor: 300,
    nowMs: NOW,
  });
}

describe('eventCardSummary (D37 item 10)', () => {
  it('menor inteira à venda, com a taxa de serviço do comprador somada', () => {
    expect(
      summary([
        type('inteira', { priceMinor: 6000 }),
        type('lote1', { priceMinor: 4000 }),
        type('meia', { kind: 'half_entry', priceMinor: 2000 }),
        type('esgotado', { priceMinor: 1000, soldCount: 100 }),
        type('pausado', { priceMinor: 1500, status: 'paused' }),
        type('antiga', { priceMinor: 500, occurrenceId: 'passada' }),
      ])
    ).toEqual({
      fromPriceMinor: 4300,
      priceUnit: 'ticket',
      serviceFeeIncluded: true,
      freeCancellationHours: 24,
    });
  });

  it('organizador que absorve a taxa: o preço do ingresso, sem a linha da taxa', () => {
    expect(summary([type('a', { priceMinor: 4000 })], 'absorb')).toMatchObject({
      fromPriceMinor: 4000,
      serviceFeeIncluded: false,
    });
  });

  it('só gratuito à venda: R$ 0; nada à venda: sem preço', () => {
    expect(summary([type('free', { kind: 'free', priceMinor: 0 })])).toMatchObject({
      fromPriceMinor: 0,
      serviceFeeIncluded: false,
    });
    expect(summary([type('fim', { salesEndsAt: '2026-11-30T00:00:00.000Z' })])).toBeNull();
  });
});
