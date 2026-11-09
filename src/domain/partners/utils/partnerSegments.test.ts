import { describe, expect, it } from 'vitest';
import {
  catalogSegmentsFor,
  catalogTabLabel,
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
