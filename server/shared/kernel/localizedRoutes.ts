import { DEFAULT_LOCALE, type Locale, SUPPORTED_LOCALES } from './locale';

export const ROUTE_KEYS = [
  'explore',
  'events',
  'tours',
  'stays',
  'restaurants',
  'attractions',
  'guide',
  'favorites',
] as const;
export type RouteKey = (typeof ROUTE_KEYS)[number];

/**
 * Fonte única das URLs por idioma (decisão D6): português na raiz, en e fr em pastas com slug traduzido.
 * Espelho de src/shared/i18n/localizedRoutes.ts; o teste de paridade garante que são iguais.
 */
export const LOCALIZED_ROUTES: Record<RouteKey, Record<Locale, string>> = {
  explore: { 'pt-BR': '/', en: '/en', fr: '/fr' },
  events: { 'pt-BR': '/eventos', en: '/en/events', fr: '/fr/evenements' },
  tours: { 'pt-BR': '/passeios', en: '/en/tours', fr: '/fr/excursions' },
  stays: { 'pt-BR': '/pousadas', en: '/en/stays', fr: '/fr/hebergements' },
  restaurants: { 'pt-BR': '/restaurantes', en: '/en/restaurants', fr: '/fr/restaurants' },
  attractions: { 'pt-BR': '/pontos', en: '/en/attractions', fr: '/fr/attractions' },
  guide: { 'pt-BR': '/info', en: '/en/travel-guide', fr: '/fr/guide-pratique' },
  favorites: { 'pt-BR': '/favoritos', en: '/en/favorites', fr: '/fr/favoris' },
};

export const INDEXABLE_ROUTE_KEYS: readonly RouteKey[] = ROUTE_KEYS.filter(
  (key) => key !== 'favorites'
);

function normalizePathname(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function localizedPath(routeKey: RouteKey, locale: Locale): string {
  return LOCALIZED_ROUTES[routeKey][locale];
}

export function parseLocalizedPath(
  pathname: string
): { locale: Locale; routeKey: RouteKey } | null {
  const normalized = normalizePathname(pathname);
  for (const routeKey of ROUTE_KEYS) {
    for (const locale of SUPPORTED_LOCALES) {
      if (LOCALIZED_ROUTES[routeKey][locale] === normalized) {
        return { locale, routeKey };
      }
    }
  }
  return null;
}

/** Mesma página em outro idioma, preservando a query (ex: `?item=&type=`). Fora do mapa, vai para a home. */
export function switchLocalePath(pathname: string, search: string, target: Locale): string {
  const parsed = parseLocalizedPath(pathname);
  const basePath = localizedPath(parsed?.routeKey ?? 'explore', target);
  return `${basePath}${search}`;
}

export function resolveLocaleFromPathname(pathname: string): Locale | null {
  return parseLocalizedPath(pathname)?.locale ?? null;
}

export { DEFAULT_LOCALE };
