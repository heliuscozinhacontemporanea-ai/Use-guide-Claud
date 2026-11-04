import { describe, expect, it } from 'vitest';
import type { PartnerHomeView } from '../types/partnerHome';
import {
  countAttentionByEstablishment,
  filterPartnerHome,
  shortEstablishmentName,
} from './partnerHomeFilter';

const today = (id: string, establishmentIds: string[]) => ({
  kind: 'slot' as const,
  id,
  parentId: 'o',
  establishmentIds,
  title: id,
  startsAt: '2026-11-08T12:00:00.000Z',
  endsAt: null,
  sold: 0,
  capacity: 1,
  checkedIn: 0,
  arrivedAt: null,
});

const VIEW: PartnerHomeView = {
  cards: [],
  establishments: [],
  attention: [
    { kind: 'debt', refId: 'd', establishmentIds: ['a', 'b'], title: null, deadline: null },
    { kind: 'plan_expiring', refId: 'b', establishmentIds: ['b'], title: null, deadline: null },
  ],
  today: [today('x', ['a']), today('y', ['b']), today('z', [])],
  numbers: {
    salesTodayMinor: 0,
    salesTodayCount: 0,
    nextPayout: null,
    month: { currentMinor: 0, previousMinor: 0 },
  },
  upcomingSessions: [],
  week: [],
  plans: [],
};

describe('filtro do painel', () => {
  it('mantém "Resolva agora" inteiro e filtra o dia; item sem estabelecimento aparece sempre', () => {
    const filtered = filterPartnerHome(VIEW, 'a');
    expect(filtered.attention).toHaveLength(2);
    expect(filtered.today.map((item) => item.id)).toEqual(['x', 'z']);
    expect(filterPartnerHome(VIEW, null).today).toHaveLength(3);
  });

  it('conta pendências por estabelecimento', () => {
    expect(countAttentionByEstablishment(VIEW)).toEqual({ a: 1, b: 2 });
  });

  it('usa a primeira palavra útil como etiqueta', () => {
    expect(shortEstablishmentName('Buggy do Preá')).toBe('Buggy');
    expect(shortEstablishmentName('A Pousada Vento Leste')).toBe('Pousada');
  });
});
