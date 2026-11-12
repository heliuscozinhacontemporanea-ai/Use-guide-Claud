import { describe, expect, it } from 'vitest';
import type { PartnerGuestSession } from '../types/partnerHome';
import { pickGuestSession } from './guestsCard';

const TZ = 'America/Fortaleza';
const at = (iso: string) => new Date(iso).getTime();
const session = (
  id: string,
  startsAt: string,
  endsAt: string | null = null
): PartnerGuestSession => ({
  id,
  eventId: 'e',
  title: 'Luau',
  establishmentIds: [],
  startsAt,
  endsAt,
  courtesies: 12,
  entered: 8,
});

describe('cartão Convidados (C7)', () => {
  // Sábado, 20 de dez., 20:00 às 02:00 em Fortaleza.
  const luau = session('s1', '2026-12-20T23:00:00.000Z', '2026-12-21T05:00:00.000Z');

  it('antes, com a portaria aberta e o resumo até o fim do dia seguinte', () => {
    const phase = (iso: string) => pickGuestSession([luau], at(iso), TZ)?.phase ?? null;
    expect(phase('2026-12-20T20:59:00.000Z')).toBe('before');
    expect(phase('2026-12-20T21:00:00.000Z')).toBe('open');
    expect(phase('2026-12-21T05:00:00.000Z')).toBe('open');
    expect(phase('2026-12-21T05:01:00.000Z')).toBe('after');
    // Acabou no domingo, 21: o resumo fica até o fim de segunda, 22 (03:00 UTC de terça).
    expect(phase('2026-12-23T02:59:00.000Z')).toBe('after');
    expect(phase('2026-12-23T03:00:00.000Z')).toBeNull();
  });

  it('a portaria aberta vence o resumo, e o resumo vence a próxima sessão', () => {
    const next = session('s2', '2026-12-21T23:00:00.000Z');
    expect(pickGuestSession([luau, next], at('2026-12-21T12:00:00.000Z'), TZ)).toMatchObject({
      session: { id: 's1' },
      phase: 'after',
    });
    expect(pickGuestSession([luau, next], at('2026-12-21T21:30:00.000Z'), TZ)).toMatchObject({
      session: { id: 's2' },
      phase: 'open',
    });
    expect(pickGuestSession([], at('2026-12-21T21:30:00.000Z'), TZ)).toBeNull();
  });
});
