import { describe, expect, it, vi } from 'vitest';
import type { SeoContentPort } from '../ports/seoContentPort';
import { SitemapService } from './sitemapService';

describe('SitemapService', () => {
  it('lista rotas fixas, itens e eventos com & escapado', async () => {
    const port: SeoContentPort = {
      getGuideItem: vi.fn(),
      getEvent: vi.fn(),
      listIndexableEntries: vi.fn().mockResolvedValue([
        { id: 'item-1', category: 'hotel' },
        { id: 'event-1', category: 'event' },
      ]),
    };
    const xml = await new SitemapService(port).renderXml();
    expect(xml).toContain('<loc>https://useguide.com.br/</loc>');
    expect(xml).toContain('<loc>https://useguide.com.br/info</loc>');
    expect(xml).toContain('<loc>https://useguide.com.br/pousadas?item=item-1&amp;type=item</loc>');
    expect(xml).toContain('<loc>https://useguide.com.br/eventos?item=event-1&amp;type=event</loc>');
    expect(xml).not.toMatch(/&(?!amp;)/);
  });

  it('emite uma URL por idioma com os alternates e o x-default', async () => {
    const port: SeoContentPort = {
      getGuideItem: vi.fn(),
      getEvent: vi.fn(),
      listIndexableEntries: vi.fn().mockResolvedValue([{ id: 'event-1', category: 'event' }]),
    };
    const xml = await new SitemapService(port).renderXml();
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain(
      '<loc>https://useguide.com.br/fr/evenements?item=event-1&amp;type=event</loc>'
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="en" href="https://useguide.com.br/en/events?item=event-1&amp;type=event" />'
    );
    expect(xml).toContain(
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://useguide.com.br/" />'
    );
    expect(xml).not.toContain('favoris');
    // 9 rotas indexáveis + 1 evento, cada um em 3 idiomas.
    expect(xml.match(/<url>/g)).toHaveLength(30);
  });
});
