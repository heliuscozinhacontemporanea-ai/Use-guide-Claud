import { describe, expect, it, vi } from 'vitest';
import type { HtmlTemplatePort } from '../ports/htmlTemplatePort';
import type { SeoContentPort } from '../ports/seoContentPort';
import type { SeoEvent, SeoGuideItem } from '../types/seoTypes';
import { SeoHtmlService } from './seoHtmlService';

const NOW = new Date('2026-10-10T12:00:00.000Z');

function buildItem(overrides: Partial<SeoGuideItem> = {}): SeoGuideItem {
  return {
    id: 'item-1',
    name: 'Restaurante A',
    description: 'Frutos do mar na beira da praia.',
    category: 'restaurant',
    image: 'https://firebasestorage.googleapis.com/v0/b/x/o/a.webp',
    location: 'jeri',
    address: 'Rua Principal, 10',
    cuisineType: 'Frutos do mar',
    rating: 4.5,
    reviewCount: 12,
    ...overrides,
  };
}

function buildEvent(overrides: Partial<SeoEvent> = {}): SeoEvent {
  return {
    id: 'event-1',
    name: 'Sunset na Duna',
    description: 'Pôr do sol com DJ.',
    image: 'https://firebasestorage.googleapis.com/v0/b/x/o/e.webp',
    locationName: 'Duna do Pôr do Sol',
    occurrences: [],
    ...overrides,
  };
}

function createService(content: Partial<SeoContentPort> = {}) {
  const port: SeoContentPort = {
    getGuideItem: vi.fn().mockResolvedValue(null),
    getEvent: vi.fn().mockResolvedValue(null),
    listIndexableEntries: vi.fn().mockResolvedValue([]),
    ...content,
  };
  const template: HtmlTemplatePort = { getTemplate: vi.fn().mockResolvedValue('<html></html>') };
  return { service: new SeoHtmlService(port, template, () => NOW), port };
}

describe('SeoHtmlService.buildMetadata', () => {
  it('usa os metadados da rota quando não há item', async () => {
    const { service } = createService();
    const meta = await service.buildMetadata('/eventos/', {});
    expect(meta.canonicalUrl).toBe('https://useguide.com.br/eventos');
    expect(meta.robots).toBeUndefined();
  });

  it('marca rota desconhecida como noindex', async () => {
    const { service } = createService();
    const meta = await service.buildMetadata('/qualquer-coisa', {});
    expect(meta.robots).toBe('noindex, follow');
  });

  it('monta título, canonical da categoria e JSON-LD de restaurante', async () => {
    const { service } = createService({ getGuideItem: vi.fn().mockResolvedValue(buildItem()) });
    const meta = await service.buildMetadata('/', { item: 'item-1', type: 'item' });
    expect(meta.title).toBe('Restaurante A | Use Guide');
    expect(meta.canonicalUrl).toBe('https://useguide.com.br/restaurantes?item=item-1&type=item');
    expect(meta.structuredData).toMatchObject({
      '@type': 'Restaurant',
      servesCuisine: 'Frutos do mar',
      address: { addressLocality: 'Jericoacoara', addressRegion: 'CE', addressCountry: 'BR' },
      aggregateRating: { ratingValue: 4.5, reviewCount: 12 },
    });
  });

  it('não emite aggregateRating sem avaliações', async () => {
    const { service } = createService({
      getGuideItem: vi.fn().mockResolvedValue(buildItem({ reviewCount: 0, rating: 0 })),
    });
    const meta = await service.buildMetadata('/restaurantes', { item: 'item-1', type: 'item' });
    expect(meta.structuredData).not.toHaveProperty('aggregateRating');
  });

  it('item inexistente ou inativo vira noindex', async () => {
    const { service } = createService();
    const meta = await service.buildMetadata('/restaurantes', { item: 'nao-existe', type: 'item' });
    expect(meta.robots).toBe('noindex, follow');
    expect(meta.title).toBe('Sabores Locais & Gastronomia | Use Guide');
  });

  it('não consulta o banco com ID inválido', async () => {
    const { service, port } = createService();
    const meta = await service.buildMetadata('/', { item: '../users/abc', type: 'item' });
    expect(port.getGuideItem).not.toHaveBeenCalled();
    expect(meta.robots).toBe('noindex, follow');
  });

  it('ignora parâmetros que não são texto', async () => {
    const { service, port } = createService();
    await service.buildMetadata('/', { item: ['a', 'b'] });
    expect(port.getGuideItem).not.toHaveBeenCalled();
  });

  it('evento sem ocorrência não emite @type Event', async () => {
    const { service } = createService({ getEvent: vi.fn().mockResolvedValue(buildEvent()) });
    const meta = await service.buildMetadata('/eventos', { item: 'event-1', type: 'event' });
    expect(meta.structuredData).toMatchObject({ '@type': 'WebPage' });
    expect(meta.canonicalUrl).toBe('https://useguide.com.br/eventos?item=event-1&type=event');
  });

  it('evento usa a próxima ocorrência futura', async () => {
    const event = buildEvent({
      occurrences: [
        { startsAt: '2026-10-01T21:00:00.000Z', endsAt: '2026-10-01T23:00:00.000Z' },
        { startsAt: '2026-10-20T21:00:00.000Z', endsAt: '2026-10-20T23:00:00.000Z' },
        { startsAt: '2026-10-15T21:00:00.000Z', endsAt: '2026-10-15T23:00:00.000Z' },
      ],
    });
    const { service } = createService({ getEvent: vi.fn().mockResolvedValue(event) });
    const meta = await service.buildMetadata('/eventos', { item: 'event-1', type: 'event' });
    expect(meta.structuredData).toMatchObject({
      '@type': 'Event',
      startDate: '2026-10-15T21:00:00.000Z',
      location: { '@type': 'Place', name: 'Duna do Pôr do Sol' },
    });
  });

  it('usa a imagem padrão quando a do item não é https absoluta', async () => {
    const { service } = createService({
      getGuideItem: vi.fn().mockResolvedValue(buildItem({ image: '/local.png' })),
    });
    const meta = await service.buildMetadata('/', { item: 'item-1', type: 'item' });
    expect(meta.image).toMatch(/^https:\/\/firebasestorage\.googleapis\.com\//);
    expect(meta.image).not.toContain('local.png');
  });

  it('admin é sempre noindex', async () => {
    const { service } = createService();
    const meta = await service.buildMetadata('/', { admin: '1' });
    expect(meta.robots).toBe('noindex, nofollow');
  });

  it('página de evento em francês: canonical no idioma da URL e alternates com a mesma query', async () => {
    const { service } = createService({ getEvent: vi.fn().mockResolvedValue(buildEvent()) });
    const meta = await service.buildMetadata('/fr/evenements', { item: 'event-1', type: 'event' });
    expect(meta.locale).toBe('fr');
    expect(meta.canonicalUrl).toBe('https://useguide.com.br/fr/evenements?item=event-1&type=event');
    expect(meta.alternates).toEqual([
      { hreflang: 'pt-BR', href: 'https://useguide.com.br/eventos?item=event-1&type=event' },
      { hreflang: 'en', href: 'https://useguide.com.br/en/events?item=event-1&type=event' },
      { hreflang: 'fr', href: 'https://useguide.com.br/fr/evenements?item=event-1&type=event' },
      { hreflang: 'x-default', href: 'https://useguide.com.br/eventos?item=event-1&type=event' },
    ]);
  });

  it('rota em inglês usa os textos em inglês', async () => {
    const { service } = createService();
    const meta = await service.buildMetadata('/en/tours', {});
    expect(meta.title).toBe('Adventure & Tours | Use Guide');
    expect(meta.canonicalUrl).toBe('https://useguide.com.br/en/tours');
  });

  it('item em inglês aponta para a listagem da categoria em inglês', async () => {
    const { service } = createService({
      getGuideItem: vi.fn().mockResolvedValue(buildItem({ category: 'hotel' })),
    });
    const meta = await service.buildMetadata('/en', { item: 'item-1', type: 'item' });
    expect(meta.canonicalUrl).toBe('https://useguide.com.br/en/stays?item=item-1&type=item');
  });

  it('favoritos não é indexado', async () => {
    const { service } = createService();
    const meta = await service.buildMetadata('/fr/favoris', {});
    expect(meta.robots).toBe('noindex, follow');
  });
});
