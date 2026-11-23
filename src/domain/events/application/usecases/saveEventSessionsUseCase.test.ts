import { beforeEach, describe, expect, it, vi } from 'vitest';

const { calls, record } = vi.hoisted(() => {
  const calls: string[] = [];
  const record = (name: string) =>
    vi.fn(async () => {
      calls.push(name);
    });
  return { calls, record };
});

vi.mock('./createPartnerEventOccurrenceUseCase', () => ({
  createPartnerEventOccurrenceUseCase: record('partner:create'),
}));
vi.mock('./updatePartnerEventOccurrenceUseCase', () => ({
  updatePartnerEventOccurrenceUseCase: record('partner:update'),
}));
vi.mock('./deletePartnerEventOccurrenceUseCase', () => ({
  deletePartnerEventOccurrenceUseCase: record('partner:delete'),
}));

import { saveEventSessionsUseCase } from './saveEventSessionsUseCase';

const sessions = [
  {
    id: 'kept',
    startsAt: '2026-11-01T20:00:00.000Z',
    endsAt: '2026-11-01T23:00:00.000Z',
    capacity: 80,
  },
  { startsAt: '2026-11-02T20:00:00.000Z', endsAt: '2026-11-02T23:00:00.000Z', capacity: 80 },
];

describe('saveEventSessionsUseCase', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  it('cria e altera antes de apagar, pelas rotas do parceiro (o admin usa as mesmas, F4)', async () => {
    await saveEventSessionsUseCase({
      eventListingId: 'ev1',
      savedIds: ['kept', 'removed'],
      sessions,
    });
    expect(calls).toEqual(['partner:create', 'partner:update', 'partner:delete']);
  });
});
