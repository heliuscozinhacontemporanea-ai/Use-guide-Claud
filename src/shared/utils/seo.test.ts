import { describe, it, expect, beforeEach } from 'vitest';
import { getRouteSeoMetadata, updateDocumentSEO } from './seo';

describe('updateDocumentSEO utility', () => {
  beforeEach(() => {
    document.title = '';
    document.head.innerHTML = '';
  });

  it('sets default title and standard meta tags when empty metadata is provided', () => {
    updateDocumentSEO({});

    expect(document.title).toContain('Use Guide');

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toBeTruthy();

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute('content')).toContain('Use Guide');

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute('content')).toBe('summary_large_image');
  });

  it('updates title and meta tags with custom page metadata', () => {
    updateDocumentSEO({
      title: 'Restaurantes & Gastronomia',
      description: 'Melhores restaurantes de Jeri',
      keywords: ['restaurante', 'gastronomia', 'jeri'],
      image: 'https://example.com/banner.jpg',
      type: 'place',
    });

    expect(document.title).toBe('Restaurantes & Gastronomia | Use Guide');

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute('content')).toBe('Melhores restaurantes de Jeri');

    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    expect(keywordsMeta?.getAttribute('content')).toBe('restaurante, gastronomia, jeri');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toBe('https://example.com/banner.jpg');

    const ogType = document.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute('content')).toBe('place');

    const canonicalLink = document.querySelector('link[rel="canonical"]');
    expect(canonicalLink?.getAttribute('href')).toBeTruthy();

    const schemaScript = document.getElementById('schema-structured-data');
    expect(schemaScript?.textContent).toBeTruthy();
    const parsedSchema = JSON.parse(schemaScript!.textContent || '{}');
    expect(parsedSchema['@context']).toBe('https://schema.org');
    expect(parsedSchema['@type']).toBe('TouristDestination');
  });

  it('correctly resolves relative image URLs to absolute URLs', () => {
    updateDocumentSEO({
      image: '/images/hero.jpg',
    });

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage?.getAttribute('content')).toMatch(/^https?:\/\//);
  });

  it('sets robots and custom structured data when provided', () => {
    updateDocumentSEO({
      robots: 'noindex, nofollow',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: 'Festival de Jeri',
      },
    });

    const robotsMeta = document.querySelector('meta[name="robots"]');
    expect(robotsMeta?.getAttribute('content')).toBe('noindex, nofollow');

    const schemaScript = document.getElementById('schema-structured-data');
    const parsedSchema = JSON.parse(schemaScript!.textContent || '{}');
    expect(parsedSchema['@type']).toBe('Event');
    expect(parsedSchema.name).toBe('Festival de Jeri');
  });

  it('correctly formats titles that already include Use Guide', () => {
    updateDocumentSEO({
      title: 'Jeri Wind Alert | Use Guide',
    });

    expect(document.title).toBe('Jeri Wind Alert | Use Guide');
  });

  it('monta os metadados da rota no idioma da URL', () => {
    expect(getRouteSeoMetadata('/eventos')).toMatchObject({
      title: 'Eventos & Experiências | Use Guide',
      canonicalUrl: 'https://useguide.com.br/eventos',
      locale: 'pt-BR',
    });
    expect(getRouteSeoMetadata('/fr/evenements')).toMatchObject({
      title: 'Événements & Expériences | Use Guide',
      canonicalUrl: 'https://useguide.com.br/fr/evenements',
      locale: 'fr',
    });
  });

  it('rotas fora do mapa: admin noindex, desconhecida noindex', () => {
    expect(getRouteSeoMetadata('/admin').robots).toBe('noindex, nofollow');
    expect(getRouteSeoMetadata('/nao-existe').robots).toBe('noindex, follow');
  });

  it('og:locale segue o idioma da página', () => {
    updateDocumentSEO({ title: 'x', locale: 'en' });
    expect(document.querySelector('meta[property="og:locale"]')?.getAttribute('content')).toBe('en_US');
  });
});
