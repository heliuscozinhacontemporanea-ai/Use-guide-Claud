import { describe, expect, it } from 'vitest';
import type { Ticket, TicketType } from '../../../domain/ticketing';
import { buildEventLots } from './buildEventLots';

const type = (id: string, overrides: Partial<TicketType> = {}) =>
  ({
    id,
    occurrenceId: 'occ1',
    name: id,
    kind: 'paid',
    priceMinor: 10000,
    quantity: 2,
    status: 'on_sale',
    sortOrder: 0,
    ...overrides,
  }) as TicketType;
const ticket = (ticketTypeId: string, issuedAt: string, overrides: Partial<Ticket> = {}) =>
  ({
    ticketTypeId,
    status: 'issued',
    issuedAt,
    holderEmail: 'segredo@exemplo.com',
    ticketTypeSnapshot: { name: 'x', kind: 'paid', unitPriceMinor: 10000 },
    ...overrides,
  }) as Ticket;

describe('buildEventLots (A5)', () => {
  it('conta vendidos sem cortesia nem reembolsado, por dia no fuso do evento, e a situação', () => {
    const lots = buildEventLots({
      nowIso: '2026-12-10T12:00:00.000Z',
      timeZone: 'America/Fortaleza',
      ticketTypes: [
        type('l1', { sortOrder: 1 }),
        type('l2', { sortOrder: 2, quantity: 10 }),
        type('l3', { sortOrder: 3, salesStartsAt: '2026-12-15T00:00:00.000Z' }),
        type('l4', { sortOrder: 4, salesEndsAt: '2026-12-01T00:00:00.000Z' }),
        type('rascunho', { status: 'draft' }),
        type('cortesia', { kind: 'courtesy' }),
      ],
      tickets: [
        // 02:30 UTC ainda é dia 8 em Fortaleza.
        ticket('l1', '2026-12-09T02:30:00.000Z'),
        ticket('l1', '2026-12-09T15:00:00.000Z', { status: 'checked_in' }),
        ticket('l2', '2026-12-09T15:00:00.000Z'),
        ticket('l2', '2026-12-09T16:00:00.000Z', { status: 'refunded' }),
        ticket('l2', '2026-12-09T16:00:00.000Z', { courtesyId: 'c1' }),
        ticket('l2', '2026-12-09T16:00:00.000Z', { status: 'transferred' }),
      ],
    });
    expect(lots.map((lot) => [lot.id, lot.sold, lot.soldMinor, lot.status])).toEqual([
      ['l1', 2, 20000, 'sold_out'],
      ['l2', 1, 10000, 'on_sale'],
      ['l3', 0, 0, 'not_started'],
      ['l4', 0, 0, 'ended'],
    ]);
    expect(lots[0]?.days).toEqual([
      { day: '2026-12-08', count: 1 },
      { day: '2026-12-09', count: 1 },
    ]);
    expect(JSON.stringify(lots)).not.toContain('segredo');
  });
});
