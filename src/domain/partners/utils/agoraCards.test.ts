import { describe, expect, it } from 'vitest';
import type { PartnerTodayItem } from '../types/partnerHome';
import { agoraCards, serviceInProgress } from './agoraCards';

// Sábado, 8 de novembro, 09:00 em Fortaleza.
const START = '2026-11-08T12:00:00.000Z';
const at = (iso: string) => new Date(iso).getTime();

function slot(overrides: Partial<PartnerTodayItem> = {}): PartnerTodayItem {
  return {
    kind: 'slot',
    id: 'h1',
    parentId: 'o1',
    establishmentIds: ['buggy'],
    title: 'Passeio',
    offerKind: 'tour',
    startsAt: START,
    endsAt: null,
    sold: 6,
    capacity: 8,
    checkedIn: 0,
    arrivedAt: null,
    bookings: 3,
    waitingBookings: 3,
    meetingPoint: 'Praça Principal',
    serviceEndsAt: '2026-11-08T14:00:00.000Z',
    ...overrides,
  };
}

const types = (items: PartnerTodayItem[], now: string) =>
  agoraCards(items, at(now)).map((card) => card.type);

describe('agoraCards', () => {
  it('passeio: código de 2 h antes, "Cheguei" nos 30 min antes do início', () => {
    expect(types([slot()], '2026-11-08T09:59:00.000Z')).toEqual([]);
    expect(types([slot()], '2026-11-08T10:00:00.000Z')).toEqual(['code']);
    expect(types([slot()], '2026-11-08T11:30:00.000Z')).toEqual(['arrive']);
    // Depois do início sem "Cheguei", fica o código.
    expect(types([slot()], '2026-11-08T12:05:00.000Z')).toEqual(['code']);
  });

  it('depois do "Cheguei" mostra os contatos até o fim e libera a ausência em 30 min', () => {
    const arrived = slot({ arrivedAt: '2026-11-08T11:52:00.000Z' });
    const [card] = agoraCards([arrived], at('2026-11-08T11:55:00.000Z'));
    expect(card).toMatchObject({
      type: 'code',
      arrived: true,
      noShowAt: '2026-11-08T12:22:00.000Z',
    });
    const late = agoraCards([arrived], at('2026-11-08T15:00:00.000Z'))[0];
    expect(late).toMatchObject({ type: 'code', arrived: false });
  });

  it('o código vale até 12 h depois do fim', () => {
    expect(types([slot()], '2026-11-09T02:00:00.000Z')).toEqual(['code']);
    expect(types([slot()], '2026-11-09T02:01:00.000Z')).toEqual([]);
  });

  it('"Iniciar serviço" com todos com código, até o fim e só até o servidor ter o início', () => {
    const ready = slot({ checkedIn: 6, waitingBookings: 0 });
    expect(types([ready], '2026-11-08T11:58:00.000Z')).toEqual(['start']);
    const started = { ...ready, startedAt: '2026-11-08T11:57:00.000Z' };
    expect(types([started], '2026-11-08T11:58:00.000Z')).toEqual([]);
    expect(serviceInProgress(started, at('2026-11-08T13:59:00.000Z'))).toBe(true);
    expect(serviceInProgress(started, at('2026-11-08T14:00:00.000Z'))).toBe(false);
    expect(serviceInProgress(ready, at('2026-11-08T12:30:00.000Z'))).toBe(false);
    expect(types([ready], '2026-11-08T14:00:00.000Z')).toEqual([]);
    expect(types([slot({ checkedIn: 0, waitingBookings: 0 })], START)).toEqual([]);
  });

  it('horário sem reserva não entra', () => {
    expect(types([slot({ bookings: 0, sold: 0, waitingBookings: 0 })], START)).toEqual([]);
  });

  it('atração: lista na véspera e portaria de 1 h antes ao fechamento', () => {
    const entry = slot({ offerKind: 'private_entry', id: 'e1' });
    expect(types([entry], '2026-11-07T02:59:00.000Z')).toEqual([]);
    expect(types([entry], '2026-11-07T03:00:00.000Z')).toEqual(['offline']);
    expect(types([entry], '2026-11-08T11:00:00.000Z')).toEqual(['gate']);
    expect(types([entry], '2026-11-08T14:01:00.000Z')).toEqual([]);
  });

  it('evento: portaria de 2 h antes ao fim; sem fim, 6 h depois do início', () => {
    const session: PartnerTodayItem = {
      ...slot(),
      kind: 'session',
      id: 's1',
      offerKind: undefined,
      startsAt: '2026-11-08T23:00:00.000Z',
    };
    expect(types([session], '2026-11-08T20:59:00.000Z')).toEqual(['offline']);
    expect(types([session], '2026-11-08T21:00:00.000Z')).toEqual(['gate']);
    expect(types([session], '2026-11-09T05:00:00.000Z')).toEqual(['gate']);
    expect(types([session], '2026-11-09T05:01:00.000Z')).toEqual([]);
    // A lista só sai depois do fim das vendas pelo app (D21): até lá, o cartão leva a hora.
    const selling = { ...session, salesEndsAt: '2026-11-08T21:00:00.000Z' };
    const cardAt = (iso: string) => agoraCards([selling], at(iso))[0];
    expect(cardAt('2026-11-08T12:00:00.000Z')).toMatchObject({
      type: 'offline',
      listAt: '2026-11-08T21:00:00.000Z',
    });
    expect(cardAt('2026-11-08T21:00:00.000Z')).toMatchObject({ type: 'gate', listAt: null });
    const early = { ...session, salesEndsAt: '2026-11-08T15:00:00.000Z' };
    expect(agoraCards([early], at('2026-11-08T16:00:00.000Z'))[0]).toMatchObject({
      type: 'offline',
      listAt: null,
    });
    const ended = { ...session, endsAt: '2026-11-09T02:00:00.000Z' };
    expect(types([ended], '2026-11-09T02:01:00.000Z')).toEqual([]);
  });
});
