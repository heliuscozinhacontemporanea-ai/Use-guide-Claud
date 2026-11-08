import { describe, expect, it } from 'vitest';
import { groupReportBuckets } from './reportGrouping';

const day = (iso: string, soldMinor: number) => ({ start: iso, soldMinor });

describe('groupReportBuckets', () => {
  const days = [
    day('2026-11-01T03:00:00.000Z', 100), // domingo
    day('2026-11-02T03:00:00.000Z', 200), // segunda
    day('2026-11-08T03:00:00.000Z', 300), // domingo
    day('2026-11-09T03:00:00.000Z', 400), // segunda
    day('2026-12-01T03:00:00.000Z', 500),
  ];

  it('semana de segunda a domingo e mês no fuso de Fortaleza', () => {
    expect(groupReportBuckets(days, 'week')).toEqual([
      day('2026-10-26T03:00:00.000Z', 100),
      day('2026-11-02T03:00:00.000Z', 500),
      day('2026-11-09T03:00:00.000Z', 400),
      day('2026-11-30T03:00:00.000Z', 500),
    ]);
    expect(groupReportBuckets(days, 'month')).toEqual([
      day('2026-11-01T03:00:00.000Z', 1000),
      day('2026-12-01T03:00:00.000Z', 500),
    ]);
    expect(groupReportBuckets(days, 'day')).toBe(days);
  });
});
