import { describe, expect, it } from 'vitest';
import type { PartnerHomeView } from '../types/partnerHome';
import { partnerCardData } from './partnerHomeCardData';

const VIEW: PartnerHomeView = {
  timeZone: 'America/Fortaleza',
  cards: [],
  establishments: [
    {
      id: 'a',
      name: 'Buggy',
      category: 'tour',
      location: 'Preá',
      rating: 5,
      reviewCount: 1,
      unansweredReviews: 1,
    },
    {
      id: 'b',
      name: 'Pousada',
      category: 'lodging',
      location: 'Preá',
      rating: 0,
      reviewCount: 0,
      unansweredReviews: 0,
    },
  ],
  attention: [],
  today: [],
  agora: [],
  numbers: {
    salesTodayMinor: 0,
    salesTodayCount: 0,
    nextPayout: null,
    month: { currentMinor: 0, previousMinor: 0 },
  },
  promoters: null,
  tour: { show: false, tipsOff: false },
  promoCodes: null,
  upcomingSessions: [
    {
      id: 's',
      eventId: 'e',
      title: 'Luau',
      establishmentIds: ['a'],
      startsAt: '2026-12-20T23:00:00.000Z',
      sold: 1,
      capacity: 2,
      courtesies: 0,
    },
  ],
  week: [
    { date: '2026-11-08T03:00:00.000Z', establishmentIds: ['a'], sold: 2, capacity: 4 },
    { date: '2026-11-08T03:00:00.000Z', establishmentIds: ['b'], sold: 1, capacity: 4 },
  ],
  summary: { documents: 1, pendingVerifications: 0 },
  plans: [
    { itemId: 'a', until: '2027-03-12T03:00:00.000Z' },
    { itemId: 'b', until: '2026-12-01T03:00:00.000Z' },
  ],
};

describe('dados dos cartões do Início', () => {
  it('segue o filtro de estabelecimento', () => {
    expect(partnerCardData('next_event', VIEW, [], 'b')).toBeNull();
    expect(partnerCardData('reviews', VIEW, [], 'b')).toBeNull();
    expect(partnerCardData('week_bookings', VIEW, [], 'a')).toEqual({
      id: 'week_bookings',
      sold: 2,
      capacity: 4,
    });
    expect(partnerCardData('plan_seal', VIEW, [], 'a')).toMatchObject({ name: 'Buggy' });
  });

  it('com "Todos", soma os dias e mostra o plano que vence primeiro', () => {
    expect(partnerCardData('week_occupancy', VIEW, [], null)).toEqual({
      id: 'week_occupancy',
      days: [{ date: '2026-11-08T03:00:00.000Z', sold: 3, capacity: 8 }],
    });
    expect(partnerCardData('plan_seal', VIEW, [], null)).toMatchObject({ name: 'Pousada' });
  });

  it('sem plano ativo, o cartão de plano convida a conhecer os planos', () => {
    expect(partnerCardData('plan_seal', { ...VIEW, plans: [] }, [], 'a')).toEqual({
      id: 'plan_seal',
      name: 'Buggy',
      until: null,
    });
  });
});

describe('cartão Cupons', () => {
  it('aparece só com resumo e não segue o filtro de estabelecimento', () => {
    expect(partnerCardData('promo_codes', VIEW, [], null)).toBeNull();
    const summary = { active: 2, weekUses: 15, top: { code: 'VERAO', uses: 12 }, alert: null };
    expect(partnerCardData('promo_codes', { ...VIEW, promoCodes: summary }, [], 'outro')).toEqual({
      id: 'promo_codes',
      summary,
    });
  });
});
