import { describe, expect, it } from 'vitest';
import { E164_PATTERN } from './phone';

describe('E164_PATTERN', () => {
  it('aceita telefone internacional e recusa formatos locais', () => {
    expect(E164_PATTERN.test('+5588999999999')).toBe(true);
    expect(E164_PATTERN.test('+351912345678')).toBe(true);
    expect(E164_PATTERN.test('(88) 99999-9999')).toBe(false);
    expect(E164_PATTERN.test('5588999999999')).toBe(false);
    expect(E164_PATTERN.test('+0123456789')).toBe(false);
    expect(E164_PATTERN.test('https://wa.me/5588999999999')).toBe(false);
  });
});
