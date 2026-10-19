import { beforeEach, describe, expect, it, vi } from 'vitest';

const { calls, record } = vi.hoisted(() => {
  const calls: string[] = [];
  const record = (name: string) =>
    vi.fn(async () => {
      calls.push(name);
    });
  return { calls, record };
});

vi.mock('./createAdminEventOccurrenceUseCase', () => ({
  createAdminEventOccurrenceUseCase: record('admin:create'),
}));
vi.mock('./updateAdminEventOccurrenceUseCase', () => ({
  updateAdminEventOccurrenceUseCase: record('admin:update'),
}));
vi.mock('./deleteAdminEventOccurrenceUseCase', () => ({
  deleteAdminEventOccurrenceUseCase: record('admin:delete'),
}));
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

  it('parceiro: cria e altera antes de apagar, pelas rotas do parceiro', async () => {
    await saveEventSessionsUseCase({
      eventListingId: 'ev1',
      scope: 'partner',
      savedIds: ['kept', 'removed'],
      sessions,
    });
    expect(calls).toEqual(['partner:create', 'partner:update', 'partner:delete']);
  });

  it('admin usa as rotas do admin', async () => {
    await saveEventSessionsUseCase({
      eventListingId: 'ev1',
      scope: 'admin',
      savedIds: ['kept'],
      sessions,
    });
    expect(calls).toEqual(['admin:create', 'admin:update']);
  });
});
