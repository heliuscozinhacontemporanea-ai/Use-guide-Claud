import { describe, expect, it } from 'vitest';
import { isUsernameFormatValid, nextUsernameChangeAt, normalizeUsernameInput } from './username';

describe('@usuário na tela (D21)', () => {
  it('normaliza e confere o formato antes de enviar', () => {
    expect(normalizeUsernameInput(' @Ana.Souza ')).toBe('ana.souza');
    expect(isUsernameFormatValid('@ana_souza')).toBe(true);
    expect(isUsernameFormatValid('an')).toBe(false);
    expect(isUsernameFormatValid('ana souza')).toBe(false);
    expect(isUsernameFormatValid('ana.')).toBe(false);
  });

  it('troca de novo só 30 dias depois da última', () => {
    const now = new Date('2026-11-20T12:00:00.000Z');
    expect(nextUsernameChangeAt('ana', '2026-11-01T12:00:00.000Z', now)?.toISOString()).toBe(
      '2026-12-01T12:00:00.000Z'
    );
    expect(nextUsernameChangeAt('ana', '2026-10-01T12:00:00.000Z', now)).toBeNull();
    expect(nextUsernameChangeAt(null, null, now)).toBeNull();
  });
});
