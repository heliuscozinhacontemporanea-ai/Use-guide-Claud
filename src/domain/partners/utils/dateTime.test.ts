import { describe, expect, it } from 'vitest';
import { isoToLocalDateTime, localDateTimeToIso } from './dateTime';

describe('dateTime utils', () => {
  it('converte local para ISO sem crash', () => {
    const iso = localDateTimeToIso('2026-10-10T14:30');
    expect(iso).toContain('2026-10-10');
  });

  it('converte ISO para local no formato do input', () => {
    const local = isoToLocalDateTime('2026-10-10T14:30:00.000Z');
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('retorna string vazia para entrada vazia', () => {
    expect(localDateTimeToIso('')).toBe('');
    expect(isoToLocalDateTime('')).toBe('');
    expect(isoToLocalDateTime(undefined)).toBe('');
  });
});
