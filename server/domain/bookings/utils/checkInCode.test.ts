import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CHECK_IN_CODE_ALPHABET,
  checkInCodesMatch,
  deriveCheckInCode,
  listAcceptedCheckInCodes,
  normalizeCheckInCode,
} from './checkInCode';
import { checkInCodeVisibleFromMs, checkInWindow } from './checkInWindow';

const SECRET = 'a'.repeat(32);

describe('código de check-in (D20)', () => {
  beforeEach(() => {
    process.env.BOOKING_CHECKIN_CODE_SECRET = SECRET;
    delete process.env.BOOKING_CHECKIN_CODE_SECRET_PREVIOUS;
  });
  afterEach(() => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
    delete process.env.BOOKING_CHECKIN_CODE_SECRET_PREVIOUS;
  });

  it('gera 6 caracteres do alfabeto sem ambíguos, sempre iguais para a mesma reserva', () => {
    const code = deriveCheckInCode('booking-1');
    expect(code).toHaveLength(6);
    expect([...code].every((char) => CHECK_IN_CODE_ALPHABET.includes(char))).toBe(true);
    expect(deriveCheckInCode('booking-1')).toBe(code);
    expect(deriveCheckInCode('booking-2')).not.toBe(code);
  });

  it('muda com o segredo e aceita o anterior durante a rotação', () => {
    const before = deriveCheckInCode('booking-1');
    process.env.BOOKING_CHECKIN_CODE_SECRET = 'b'.repeat(32);
    process.env.BOOKING_CHECKIN_CODE_SECRET_PREVIOUS = SECRET;
    expect(deriveCheckInCode('booking-1')).not.toBe(before);
    expect(listAcceptedCheckInCodes('booking-1')).toContain(before);
  });

  it('falha sem segredo, em vez de usar valor fixo (§7.7)', () => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
    expect(() => deriveCheckInCode('booking-1')).toThrow(/BOOKING_CHECKIN_CODE_SECRET/);
  });

  it('normaliza minúsculas, espaço e hífen e recusa caracteres fora do alfabeto', () => {
    expect(normalizeCheckInCode('k7m-4qx')).toBe('K7M4QX');
    expect(normalizeCheckInCode(' K7M 4QX ')).toBe('K7M4QX');
    expect(normalizeCheckInCode('K7M4Q0')).toBeNull();
    expect(normalizeCheckInCode('K7M4Q')).toBeNull();
    expect(checkInCodesMatch('K7M4QX', 'K7M4QX')).toBe(true);
    expect(checkInCodesMatch('K7M4QX', 'K7M4QY')).toBe(false);
  });

  it('aparece às 00:00 de Fortaleza e a janela vai de 2 h antes a 12 h depois do fim', () => {
    // 08:00 em Fortaleza = 11:00 UTC; meia-noite de Fortaleza = 03:00 UTC.
    expect(new Date(checkInCodeVisibleFromMs('2026-11-10T11:00:00.000Z')).toISOString()).toBe(
      '2026-11-10T03:00:00.000Z'
    );
    // 01:00 UTC do dia 11 ainda é dia 10 em Fortaleza.
    expect(new Date(checkInCodeVisibleFromMs('2026-11-11T01:00:00.000Z')).toISOString()).toBe(
      '2026-11-10T03:00:00.000Z'
    );
    const window = checkInWindow('2026-11-10T11:00:00.000Z', 120);
    expect(new Date(window.opensAtMs).toISOString()).toBe('2026-11-10T09:00:00.000Z');
    expect(new Date(window.closesAtMs).toISOString()).toBe('2026-11-11T01:00:00.000Z');
  });
});
