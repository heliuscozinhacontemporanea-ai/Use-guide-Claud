import { describe, expect, it } from 'vitest';
import {
  isDeviceInOtherZone,
  placeTimeFormNote,
  placeTimeSuffix,
  utcOffsetLabel,
} from './placeTime';

const t = (key: string, options?: Record<string, unknown>) =>
  `${key}${options ? JSON.stringify(options) : ''}`;
const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// +14 o ano todo: nunca é o fuso do aparelho que roda o teste.
const FAR = 'Pacific/Kiritimati';

describe('hora do lugar', () => {
  it('mostra a diferença do fuso', () => {
    expect(utcOffsetLabel('America/Manaus', '2026-11-08T12:00:00.000Z')).toBe('UTC−4');
    expect(utcOffsetLabel('America/Noronha', '2026-11-08T12:00:00.000Z')).toBe('UTC−2');
    expect(utcOffsetLabel('Asia/Kolkata', '2026-11-08T12:00:00.000Z')).toBe('UTC+5:30');
  });

  it('quem está no mesmo fuso do lugar não vê nada a mais', () => {
    const place = { timeZone: deviceZone, city: 'Jericoacoara' };
    expect(isDeviceInOtherZone(place)).toBe(false);
    expect(placeTimeSuffix(t, place, '2026-11-08T23:00:00.000Z')).toBe('');
    expect(placeTimeFormNote(t, place)).toBe('');
  });

  it('quem está em outro fuso vê a cidade do lugar e a diferença', () => {
    const place = { timeZone: FAR, city: 'Jericoacoara' };
    expect(placeTimeSuffix(t, place, '2026-11-08T23:00:00.000Z')).toBe(
      ' placeTime.suffix{"place":"Jericoacoara"}'
    );
    expect(placeTimeFormNote(t, place)).toBe(
      'placeTime.formNote{"place":"Jericoacoara","offset":"UTC+14"}'
    );
    expect(placeTimeSuffix(t, { timeZone: FAR }, '2026-11-08T23:00:00.000Z')).toBe(
      ' placeTime.suffixLocal'
    );
  });
});
