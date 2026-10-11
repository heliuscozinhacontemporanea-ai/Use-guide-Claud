import type { Locale } from '../../../shared/kernel/locale';

/** Valores aceitos em og:type (https://ogp.me/#types). */
export type SeoPageType = 'website' | 'article';

export interface SeoMetadata {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type?: SeoPageType;
  robots?: string;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
  /** Idioma da página (da URL); padrão pt-BR. */
  locale?: Locale;
  /** Versões da mesma página em cada idioma, para `<link rel="alternate" hreflang>`. */
  alternates?: SeoAlternate[];
}

export interface SeoAlternate {
  hreflang: Locale | 'x-default';
  href: string;
}

export type SeoGuideCategory = 'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel';

/** Projeção pública de um item do guia: só campos que podem aparecer no HTML indexável. */
export interface SeoGuideItem {
  id: string;
  name: string;
  description: string;
  category: SeoGuideCategory;
  image?: string;
  location?: string;
  address?: string;
  cuisineType?: string;
  rating: number;
  reviewCount: number;
}

export interface SeoEventOccurrence {
  startsAt: string;
  endsAt: string;
  locationName?: string;
  locationAddress?: string;
}

/** Projeção pública de um evento publicado e público. */
export interface SeoEvent {
  id: string;
  name: string;
  description: string;
  image?: string;
  locationName?: string;
  locationAddress?: string;
  /** Ocorrências públicas, em ordem de início. */
  occurrences: SeoEventOccurrence[];
}

export interface SeoSitemapEntry {
  id: string;
  category: SeoGuideCategory | 'event';
}
