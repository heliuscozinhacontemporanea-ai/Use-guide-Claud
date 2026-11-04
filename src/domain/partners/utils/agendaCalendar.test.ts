import { describe, expect, it } from 'vitest';
import { businessDay, monthGrid, sameBusinessDay, weekStart } from './agendaCalendar';

describe('calendário da Agenda (fuso de Fortaleza)', () => {
  it('o dia vira à meia-noite de Fortaleza, não à de UTC', () => {
    expect(businessDay(new Date('2026-11-05T02:59:00.000Z')).toISOString()).toBe(
      '2026-11-04T03:00:00.000Z'
    );
    expect(sameBusinessDay('2026-11-05T02:59:00.000Z', '2026-11-04T12:00:00.000Z')).toBe(true);
  });

  it('a semana começa na segunda', () => {
    // 4 de novembro de 2026 é uma quarta-feira.
    expect(weekStart(new Date('2026-11-04T15:00:00.000Z')).toISOString()).toBe(
      '2026-11-02T03:00:00.000Z'
    );
    expect(weekStart(new Date('2026-11-08T15:00:00.000Z')).toISOString()).toBe(
      '2026-11-02T03:00:00.000Z'
    );
  });

  it('o mês ocupa seis semanas a partir da segunda que inclui o dia 1', () => {
    const grid = monthGrid(new Date('2026-11-20T15:00:00.000Z'));
    expect(grid.month.toISOString()).toBe('2026-11-01T03:00:00.000Z');
    expect(grid.days[0]?.toISOString()).toBe('2026-10-26T03:00:00.000Z');
    expect(grid.days).toHaveLength(42);
  });
});
