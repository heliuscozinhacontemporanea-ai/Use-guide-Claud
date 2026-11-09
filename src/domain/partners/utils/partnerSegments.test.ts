import { describe, expect, it } from 'vitest';
import {
  addSegmentOptions,
  catalogSegmentsFor,
  catalogTabLabel,
  homeCardsFor,
  offersLabel,
  panelTabsFor,
  partnerSegments,
} from './partnerSegments';

describe('partnerSegments', () => {
  it('só passeio: abas de quem vende, aba "Passeios" e catálogo sem eventos', () => {
    const segments = partnerSegments({ categories: ['tour'], hasEvents: false });
    expect(segments).toEqual(['tours']);
    expect(panelTabsFor(segments)).toEqual(['home', 'agenda', 'catalog', 'earnings', 'more']);
    expect(catalogTabLabel(segments)).toBe('tours');
    expect(catalogSegmentsFor(segments)).toEqual(['places', 'offers']);
    expect(offersLabel(segments)).toBe('tours');
  });

  it('passeio e aluguel: aba "Ofertas" e "Serviços" no catálogo', () => {
    const segments = partnerSegments({ categories: ['rental', 'tour'], hasEvents: false });
    expect(segments).toEqual(['tours', 'rentals']);
    expect(catalogTabLabel(segments)).toBe('offers');
    expect(offersLabel(segments)).toBe('services');
  });

  it('restaurante é vitrine: sem Agenda e Ganhos, aba "Estabelecimento"', () => {
    const segments = partnerSegments({ categories: ['restaurant'], hasEvents: false });
    expect(panelTabsFor(segments)).toEqual(['home', 'catalog', 'more']);
    expect(catalogTabLabel(segments)).toBe('place');
    expect(catalogSegmentsFor(segments)).toEqual(['places']);
  });

  it('produtor de eventos: só eventos no catálogo', () => {
    const segments = partnerSegments({ categories: ['producer'], hasEvents: true });
    expect(segments).toEqual(['events']);
    expect(catalogTabLabel(segments)).toBe('events');
    expect(catalogSegmentsFor(segments)).toEqual(['events']);
  });

  it('restaurante que também organiza eventos passa a vender', () => {
    const segments = partnerSegments({ categories: ['restaurant'], hasEvents: true });
    expect(panelTabsFor(segments)).toContain('earnings');
    expect(catalogTabLabel(segments)).toBe('offers');
    expect(catalogSegmentsFor(segments)).toEqual(['places', 'events']);
  });

  it('sem cadastro ainda, mostra tudo', () => {
    const segments = partnerSegments({ categories: [], hasEvents: false });
    expect(panelTabsFor(segments)).toHaveLength(5);
    expect(catalogTabLabel(segments)).toBe('catalog');
  });
});

describe('addSegmentOptions', () => {
  it('marca o que o parceiro já tem e abre o cadastro do resto', () => {
    const rows = addSegmentOptions(['tours', 'lodging']);
    expect(rows.find((row) => row.id === 'tours')).toEqual({
      id: 'tours',
      has: true,
      categories: [],
    });
    expect(rows.find((row) => row.id === 'rentals')).toEqual({
      id: 'rentals',
      has: false,
      categories: ['rental'],
    });
    // Com hospedagem, a vitrine ainda oferece o restaurante.
    expect(rows.find((row) => row.id === 'showcase')).toEqual({
      id: 'showcase',
      has: false,
      categories: ['restaurant'],
    });
  });

  it('eventos abrem o perfil de produtor', () => {
    expect(addSegmentOptions([]).find((row) => row.id === 'events')?.categories).toEqual([
      'producer',
    ]);
  });
});

describe('homeCardsFor', () => {
  it('vitrine: só avaliações e plano', () => {
    expect(homeCardsFor(['restaurant'])).toEqual(['reviews', 'plan_seal']);
  });

  it('passeio: vendas e agenda, sem cartões de evento', () => {
    const cards = homeCardsFor(['tours']) ?? [];
    expect(cards).toContain('sales_today');
    expect(cards).toContain('week_bookings');
    expect(cards).not.toContain('next_event');
  });

  it('sem cadastro: todos', () => {
    expect(homeCardsFor([])).toBeNull();
  });
});
