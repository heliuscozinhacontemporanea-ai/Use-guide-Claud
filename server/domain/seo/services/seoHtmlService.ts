import { DEFAULT_LOCALE, type Locale } from '../../../shared/kernel/locale';
import { parseLocalizedPath, type RouteKey } from '../../../shared/kernel/localizedRoutes';
import type { HtmlTemplatePort } from '../ports/htmlTemplatePort';
import type { SeoContentPort } from '../ports/seoContentPort';
import type { SeoMetadata } from '../types/seoTypes';
import { truncateDescription } from '../utils/htmlEscape';
import { injectSeo } from '../utils/injectSeo';
import { absoluteUrl, buildAlternates, itemSearch } from '../utils/localizedUrls';
import {
  CATEGORY_ROUTE_KEY,
  DEFAULT_SEO_IMAGE,
  NON_LOCALIZED_ROUTE_SEO,
  ROUTE_SEO_TEXTS,
} from '../utils/routeSeo';
import {
  buildEventStructuredData,
  buildGuideItemStructuredData,
  pickRelevantOccurrence,
} from '../utils/structuredData';

export type SeoQuery = Record<string, unknown>;

// IDs de documento do Firestore gerados pelo app; qualquer outra coisa nem chega ao banco.
const DOCUMENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const NOINDEX = 'noindex, follow';

const PARTNER_INVITE_TEXTS: Record<Locale, { title: string; description: string }> = {
  'pt-BR': {
    title: 'Seja um Parceiro | Use Guide',
    description:
      'Cadastre seu negócio e alcance milhares de turistas em Jericoacoara, Preá e Barrinha.',
  },
  en: {
    title: 'Become a Partner | Use Guide',
    description:
      'List your business and reach thousands of travelers in Jericoacoara, Preá and Barrinha.',
  },
  fr: {
    title: 'Devenez Partenaire | Use Guide',
    description:
      'Inscrivez votre établissement et touchez des milliers de voyageurs à Jericoacoara, Preá et Barrinha.',
  },
};

function readString(query: SeoQuery, key: string): string | undefined {
  const value = query[key];
  return typeof value === 'string' ? value : undefined;
}

function normalizePath(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

function toAbsoluteImage(image: string | undefined): string {
  return image?.startsWith('https://') ? image : DEFAULT_SEO_IMAGE;
}

function routeMetadata(routeKey: RouteKey, locale: Locale): SeoMetadata {
  return {
    ...ROUTE_SEO_TEXTS[routeKey][locale],
    type: 'website',
    locale,
    canonicalUrl: absoluteUrl(routeKey, locale),
    alternates: buildAlternates(routeKey),
    ...(routeKey === 'favorites' ? { robots: NOINDEX } : {}),
  };
}

export class SeoHtmlService {
  constructor(
    private readonly content: SeoContentPort,
    private readonly template: HtmlTemplatePort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async renderHtml(path: string, query: SeoQuery): Promise<string> {
    const [html, metadata] = await Promise.all([
      this.template.getTemplate(),
      this.buildMetadata(path, query),
    ]);
    return injectSeo(html, metadata);
  }

  async buildMetadata(path: string, query: SeoQuery): Promise<SeoMetadata> {
    const normalizedPath = normalizePath(path);
    const parsed = parseLocalizedPath(normalizedPath);
    if (!parsed) {
      return (
        NON_LOCALIZED_ROUTE_SEO[normalizedPath] ?? {
          ...ROUTE_SEO_TEXTS.explore[DEFAULT_LOCALE],
          robots: NOINDEX,
        }
      );
    }

    const { routeKey, locale } = parsed;
    const base = routeMetadata(routeKey, locale);

    if (readString(query, 'admin') === '1') {
      return { ...NON_LOCALIZED_ROUTE_SEO['/admin']!, locale };
    }
    if (readString(query, 'partners') === '1') {
      return { ...base, ...PARTNER_INVITE_TEXTS[locale] };
    }

    const itemId = readString(query, 'item');
    if (!itemId) {
      return base;
    }
    if (!DOCUMENT_ID_PATTERN.test(itemId)) {
      return { ...base, robots: NOINDEX };
    }

    const itemMetadata =
      readString(query, 'type') === 'event'
        ? await this.buildEventMetadata(itemId, locale)
        : await this.buildGuideItemMetadata(itemId, locale);
    return itemMetadata ?? { ...base, robots: NOINDEX };
  }

  // O texto do item continua em pt-BR até existir tradução (decisão D5 em aberto);
  // só o restante da página segue o idioma da URL.
  private async buildGuideItemMetadata(id: string, locale: Locale): Promise<SeoMetadata | null> {
    const item = await this.content.getGuideItem(id);
    if (!item) return null;

    const routeKey = CATEGORY_ROUTE_KEY[item.category];
    const search = itemSearch(item.id, false);
    const url = absoluteUrl(routeKey, locale, search);
    const image = toAbsoluteImage(item.image);
    const description = truncateDescription(item.description || item.name);
    return {
      title: `${item.name} | Use Guide`,
      description,
      image,
      imageAlt: item.name,
      type: item.category === 'tips' ? 'article' : 'website',
      locale,
      canonicalUrl: url,
      alternates: buildAlternates(routeKey, search),
      structuredData: buildGuideItemStructuredData(item, { url, image, description }),
    };
  }

  private async buildEventMetadata(id: string, locale: Locale): Promise<SeoMetadata | null> {
    const event = await this.content.getEvent(id);
    if (!event) return null;

    const search = itemSearch(event.id, true);
    const url = absoluteUrl('events', locale, search);
    const image = toAbsoluteImage(event.image);
    const description = truncateDescription(event.description || event.name);
    const occurrence = pickRelevantOccurrence(event.occurrences, this.now());
    return {
      title: `${event.name} | Use Guide`,
      description,
      image,
      imageAlt: event.name,
      type: 'website',
      locale,
      canonicalUrl: url,
      alternates: buildAlternates('events', search),
      structuredData: buildEventStructuredData(event, occurrence, { url, image, description }),
    };
  }
}
