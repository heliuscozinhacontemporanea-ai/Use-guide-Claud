import { describe, expect, it } from 'vitest';
import { businessDayStartMs, businessMonthStartMs } from './businessDay';

describe('businessDayStartMs', () => {
  it('sem fuso, usa o da plataforma (UTC−3)', () => {
    expect(new Date(businessDayStartMs('2026-11-08T02:30:00.000Z')).toISOString()).toBe(
      '2026-11-07T03:00:00.000Z'
    );
  });

  it('no fuso do lugar: 00:00 em Manaus é 04:00 UTC', () => {
    expect(
      new Date(businessDayStartMs('2026-11-08T23:00:00.000Z', 'America/Manaus')).toISOString()
    ).toBe('2026-11-08T04:00:00.000Z');
  });
});

describe('businessMonthStartMs', () => {
  it('dia 1 do mês no fuso dado, e meses antes', () => {
    const at = '2026-11-01T03:30:00.000Z';
    // Em Manaus ainda é 31/10 às 23:30.
    expect(new Date(businessMonthStartMs(at, 'America/Manaus')).toISOString()).toBe(
      '2026-10-01T04:00:00.000Z'
    );
    expect(new Date(businessMonthStartMs(at, 'America/Fortaleza')).toISOString()).toBe(
      '2026-11-01T03:00:00.000Z'
    );
    expect(new Date(businessMonthStartMs(at, 'America/Fortaleza', 11)).toISOString()).toBe(
      '2025-12-01T03:00:00.000Z'
    );
  });
});
