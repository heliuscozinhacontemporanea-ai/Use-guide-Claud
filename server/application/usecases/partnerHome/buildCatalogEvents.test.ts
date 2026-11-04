import { describe, expect, it } from 'vitest';
import { buildCatalogEvents, type CatalogEventInput } from './buildCatalogEvents';

const NOW = '2026-11-08T13:00:00.000Z';

function input(overrides: Partial<CatalogEventInput['event']>, starts: string[], sold = 0) {
  return {
    event: {
      id: 'ev',
      title: 'Luau na Duna',
      name: 'Luau na Duna',
      establishmentId: 'buggy',
      status: 'published' as const,
      isActive: true,
      coverImage: 'capa.jpg',
      image: '',
      ...overrides,
    },
    occurrences: starts.map((startsAt) => ({
      startsAt,
      endsAt: startsAt,
      status: 'scheduled' as const,
    })),
    sold,
  };
}

describe('buildCatalogEvents', () => {
  it('mostra sessões, a próxima data e os vendidos; encerrado vai para o fim', () => {
    const rows = buildCatalogEvents(
      [
        input({ id: 'fim', title: 'Pôr do sol' }, ['2026-11-01T21:00:00.000Z'], 40),
        input({ id: 'luau' }, ['2026-12-20T23:00:00.000Z', '2026-12-21T23:00:00.000Z'], 168),
        input({ id: 'forro', status: 'draft', coverImage: '' }, ['2026-12-28T23:00:00.000Z']),
      ],
      NOW
    );
    expect(rows.map((row) => [row.id, row.status, row.missing])).toEqual([
      ['luau', 'published', null],
      ['forro', 'draft', 'cover'],
      ['fim', 'ended', null],
    ]);
    expect(rows[0]).toMatchObject({
      sessions: 2,
      nextStartsAt: '2026-12-20T23:00:00.000Z',
      sold: 168,
      establishmentIds: ['buggy'],
    });
  });

  it('esconde arquivados, ignora sessão cancelada e marca pausado', () => {
    const paused = input({ id: 'p', isActive: false }, ['2026-12-20T23:00:00.000Z']);
    paused.occurrences.push({
      startsAt: '2026-12-01T23:00:00.000Z',
      endsAt: '2026-12-01T23:00:00.000Z',
      status: 'canceled' as never,
    });
    const rows = buildCatalogEvents([paused, input({ id: 'a', status: 'archived' }, [])], NOW);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 'p', status: 'paused', sessions: 1 });
  });

  it('rascunho sem sessão pede a data', () => {
    const [row] = buildCatalogEvents([input({ status: 'draft' }, [])], NOW);
    expect(row).toMatchObject({ status: 'draft', missing: 'sessions', nextStartsAt: null });
  });
});
