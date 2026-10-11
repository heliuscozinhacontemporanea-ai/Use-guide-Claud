import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
import { localizedPath, type RouteKey } from '../../../shared/kernel/localizedRoutes';
import type { SeoAlternate } from '../types/seoTypes';
import { SITE_URL } from './routeSeo';

export function absoluteUrl(routeKey: RouteKey, locale: Locale, search = ''): string {
  return `${SITE_URL}${localizedPath(routeKey, locale)}${search}`;
}

/** Uma URL por idioma + `x-default` (versão pt-BR), mantendo a mesma query. */
export function buildAlternates(routeKey: RouteKey, search = ''): SeoAlternate[] {
  return [
    ...SUPPORTED_LOCALES.map((locale) => ({
      hreflang: locale,
      href: absoluteUrl(routeKey, locale, search),
    })),
    { hreflang: 'x-default' as const, href: absoluteUrl(routeKey, DEFAULT_LOCALE, search) },
  ];
}

export function itemSearch(id: string, isEvent: boolean): string {
  return `?item=${encodeURIComponent(id)}&type=${isEvent ? 'event' : 'item'}`;
}
