import { describe, expect, it } from 'vitest';
import { businessMonthKeys } from './businessDay';

describe('businessMonthKeys', () => {
  it('usa o mês de Fortaleza e volta o ano em janeiro', () => {
    // 1º de janeiro às 01:00 UTC ainda é 31 de dezembro em Fortaleza.
    expect(businessMonthKeys(new Date('2027-01-01T01:00:00Z'))).toEqual({
      current: '2026-12',
      previous: '2026-11',
    });
    expect(businessMonthKeys(new Date('2027-01-15T12:00:00Z'))).toEqual({
      current: '2027-01',
      previous: '2026-12',
    });
  });
});
