import { describe, expect, it } from 'vitest';
import { businessDayStartMs } from './businessDay';

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
