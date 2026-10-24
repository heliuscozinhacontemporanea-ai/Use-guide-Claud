import { describe, expect, it } from 'vitest';
import { isListingSealVisible } from './listingSeal';

const NOW = new Date('2026-10-24T12:00:00.000Z');

describe('isListingSealVisible (D11)', () => {
  it('mostra o selo ativo, inclusive o concedido pela equipe sem validade', () => {
    expect(
      isListingSealVisible({ isVerified: true, verifiedUntil: '2026-11-01T00:00:00.000Z' }, NOW)
    ).toBe(true);
    expect(isListingSealVisible({ isVerified: true, verifiedUntil: null }, NOW)).toBe(true);
  });

  it('esconde o selo vencido, suspenso ou inexistente', () => {
    expect(
      isListingSealVisible({ isVerified: true, verifiedUntil: '2026-10-24T11:59:00.000Z' }, NOW)
    ).toBe(false);
    expect(isListingSealVisible({ isVerified: true, isVerificationSuspended: true }, NOW)).toBe(
      false
    );
    expect(isListingSealVisible({ isVerified: false }, NOW)).toBe(false);
  });
});
