import { describe, expect, it } from 'vitest';
import {
  eventDateRangeFromSessions,
  newEventSessionDraft,
  planEventSessionChanges,
  validateEventSessions,
} from './eventSessions';

const session = (startsAt: string, endsAt: string, id?: string) => ({
  ...(id ? { id } : {}),
  startsAt,
  endsAt,
  capacity: 50,
});

describe('eventSessions', () => {
  it('separa sessões novas, alteradas e removidas', () => {
    const changes = planEventSessionChanges(
      ['a', 'b'],
      [
        session('2026-11-01T20:00:00.000Z', '2026-11-01T23:00:00.000Z', 'a'),
        session('2026-11-02T20:00:00.000Z', '2026-11-02T23:00:00.000Z'),
      ]
    );
    expect(changes.toCreate).toHaveLength(1);
    expect(changes.toUpdate.map((s) => s.id)).toEqual(['a']);
    expect(changes.toDeleteIds).toEqual(['b']);
  });

  it('valida quantidade, horários e capacidade', () => {
    expect(validateEventSessions([])).toMatch(/ao menos uma sessão/);
    expect(
      validateEventSessions([session('2026-11-01T23:00:00.000Z', '2026-11-01T20:00:00.000Z')])
    ).toMatch(/sessão 1/);
    expect(
      validateEventSessions([
        { ...session('2026-11-01T20:00:00.000Z', '2026-11-01T23:00:00.000Z'), capacity: 0 },
      ])
    ).toMatch(/capacidade/);
    expect(
      validateEventSessions([session('2026-11-01T20:00:00.000Z', '2026-11-01T23:00:00.000Z')])
    ).toBeNull();
  });

  it('o período do evento vai do primeiro início ao último término', () => {
    expect(
      eventDateRangeFromSessions([
        session('2026-11-02T20:00:00.000Z', '2026-11-02T23:00:00.000Z'),
        session('2026-11-01T20:00:00.000Z', '2026-11-01T22:00:00.000Z'),
      ])
    ).toEqual({ date: '2026-11-01T20:00:00.000Z', endDate: '2026-11-02T23:00:00.000Z' });
  });

  it('sessão sugerida dura três horas', () => {
    const draft = newEventSessionDraft(new Date('2026-11-01T20:00:00.000Z'));
    expect(draft).toEqual({
      startsAt: '2026-11-01T20:00:00.000Z',
      endsAt: '2026-11-01T23:00:00.000Z',
      capacity: 100,
    });
  });
});
