import { SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
import { INDEXABLE_ROUTE_KEYS, type RouteKey } from '../../../shared/kernel/localizedRoutes';
import type { SeoContentPort } from '../ports/seoContentPort';
import { absoluteUrl, buildAlternates, itemSearch } from '../utils/localizedUrls';
import { CATEGORY_ROUTE_KEY } from '../utils/routeSeo';

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

// Referência: https://developers.google.com/search/docs/specialty/international/localized-versions#sitemap
function renderPageUrls(routeKey: RouteKey, search: string): string[] {
  const alternates = buildAlternates(routeKey, search)
    .map(
      (alternate) =>
        `    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeXml(alternate.href)}" />`
    )
    .join('\n');
  return SUPPORTED_LOCALES.map(
    (locale) =>
      `  <url>\n    <loc>${escapeXml(absoluteUrl(routeKey, locale, search))}</loc>\n${alternates}\n  </url>`
  );
}

export class SitemapService {
  constructor(private readonly content: SeoContentPort) {}

  async renderXml(): Promise<string> {
    const entries = await this.content.listIndexableEntries();
    const urls = [
      ...INDEXABLE_ROUTE_KEYS.flatMap((routeKey) => renderPageUrls(routeKey, '')),
      ...entries.flatMap((entry) =>
        renderPageUrls(
          CATEGORY_ROUTE_KEY[entry.category],
          itemSearch(entry.id, entry.category === 'event')
        )
      ),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  }
}
