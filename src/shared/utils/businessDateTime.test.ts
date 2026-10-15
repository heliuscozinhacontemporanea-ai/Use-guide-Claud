import { describe, expect, it } from 'vitest';
import { businessDateTimeToIso, isoToBusinessDateTime } from './businessDateTime';

describe('data e hora no fuso do negócio', () => {
  it('14:30 em Fortaleza é 17:30 UTC, qualquer que seja o fuso do navegador', () => {
    expect(businessDateTimeToIso('2026-10-10T14:30')).toBe('2026-10-10T17:30:00.000Z');
  });

  it('mostra no campo a hora de Fortaleza', () => {
    expect(isoToBusinessDateTime('2026-10-10T17:30:00.000Z')).toBe('2026-10-10T14:30');
    expect(isoToBusinessDateTime('2026-10-11T01:00:00.000Z')).toBe('2026-10-10T22:00');
  });

  it('ida e volta preservam o valor digitado', () => {
    expect(isoToBusinessDateTime(businessDateTimeToIso('2026-12-31T23:59'))).toBe(
      '2026-12-31T23:59'
    );
  });

  it('vazio ou inválido vira string vazia', () => {
    expect(businessDateTimeToIso('')).toBe('');
    expect(businessDateTimeToIso('10/10/2026')).toBe('');
    expect(isoToBusinessDateTime('')).toBe('');
    expect(isoToBusinessDateTime(undefined)).toBe('');
    expect(isoToBusinessDateTime('não é data')).toBe('');
  });
});
