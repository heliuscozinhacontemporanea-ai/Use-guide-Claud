import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
import type { SeoMetadata } from '../types/seoTypes';
import { escapeHtml, serializeJsonLd } from './htmlEscape';
import { DEFAULT_SEO_IMAGE, OG_LOCALE, SITE_URL } from './routeSeo';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Toda substituição usa função: com string, `$&` ou `$1` vindos do conteúdo seriam expandidos.
function replaceMeta(html: string, attribute: 'name' | 'property', key: string, value: string) {
  const pattern = new RegExp(
    `<meta\\s+${attribute}="${escapeRegExp(key)}"\\s+content="[^"]*"\\s*/?>`,
    'i'
  );
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  if (pattern.test(html)) {
    return html.replace(pattern, () => tag);
  }
  return html.replace(/<\/head>/i, () => `    ${tag}\n  </head>`);
}

/** Aplica os metadados ao index.html. Todo valor dinâmico é escapado. */
export function injectSeo(html: string, metadata: SeoMetadata): string {
  const image = metadata.image || DEFAULT_SEO_IMAGE;
  const imageAlt = metadata.imageAlt || metadata.title;
  const url = metadata.canonicalUrl || SITE_URL;
  const robots = metadata.robots || 'index, follow';
  const type = metadata.type || 'website';
  const locale = metadata.locale ?? DEFAULT_LOCALE;

  let result = html.replace(/<html\s+lang="[^"]*"/i, () => `<html lang="${locale}"`);

  result = result.replace(
    /<title>[\s\S]*?<\/title>/i,
    () => `<title>${escapeHtml(metadata.title)}</title>`
  );

  const metaTags: Array<['name' | 'property', string, string]> = [
    ['name', 'title', metadata.title],
    ['name', 'description', metadata.description],
    ['name', 'robots', robots],
    ['property', 'og:type', type],
    ['property', 'og:locale', OG_LOCALE[locale]],
    ['property', 'og:url', url],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['property', 'og:image', image],
    ['property', 'og:image:secure_url', image],
    ['property', 'og:image:alt', imageAlt],
    ['name', 'twitter:url', url],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
    ['name', 'twitter:image', image],
  ];
  for (const [attribute, key, value] of metaTags) {
    result = replaceMeta(result, attribute, key, value);
  }

  // As dimensões declaradas no index.html são da imagem padrão; não valem para imagens de itens.
  if (image !== DEFAULT_SEO_IMAGE) {
    result = result.replace(
      /\s*<meta\s+property="og:image:(?:type|width|height)"\s+content="[^"]*"\s*\/?>/gi,
      () => ''
    );
  }

  result = result.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    () => `<link rel="canonical" href="${escapeHtml(url)}" />`
  );

  // O index.html traz os alternates da home; cada página troca pelos seus.
  result = result.replace(
    /\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/gi,
    () => ''
  );
  result = result.replace(
    /\s*<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>/gi,
    () => ''
  );
  const headExtras = [
    ...SUPPORTED_LOCALES.filter((other) => other !== locale).map(
      (other) => `<meta property="og:locale:alternate" content="${OG_LOCALE[other]}" />`
    ),
    ...(metadata.alternates ?? []).map(
      (alternate) =>
        `<link rel="alternate" hreflang="${alternate.hreflang}" href="${escapeHtml(alternate.href)}" />`
    ),
  ];
  if (headExtras.length > 0) {
    result = result.replace(
      /<\/head>/i,
      () => `${headExtras.map((tag) => `    ${tag}`).join('\n')}\n  </head>`
    );
  }

  if (metadata.structuredData) {
    const script = `<script id="schema-structured-data" type="application/ld+json">${serializeJsonLd(metadata.structuredData)}</script>`;
    result = result.replace(/<script id="schema-structured-data"[\s\S]*?<\/script>/i, () => script);
  }

  return result;
}
