import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from './locale';
import {
  INDEXABLE_ROUTE_KEYS,
  LOCALIZED_ROUTES,
  localizedPath,
  parseLocalizedPath,
  ROUTE_KEYS,
  resolveLocaleFromPathname,
  switchLocalePath,
} from './localizedRoutes';

describe('localizedRoutes', () => {
  it('nenhum caminho se repete entre rotas e idiomas', () => {
    const paths = ROUTE_KEYS.flatMap((key) => Object.values(LOCALIZED_ROUTES[key]));
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('todo caminho do mapa é reconhecido de volta', () => {
    for (const routeKey of ROUTE_KEYS) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(parseLocalizedPath(localizedPath(routeKey, locale))).toEqual({ locale, routeKey });
      }
    }
  });

  it('aceita barra final e ignora rotas fora do mapa', () => {
    expect(parseLocalizedPath('/eventos/')).toEqual({ locale: 'pt-BR', routeKey: 'events' });
    expect(parseLocalizedPath('/admin')).toBeNull();
    expect(resolveLocaleFromPathname('/checkout/result')).toBeNull();
    expect(resolveLocaleFromPathname('/en/tours')).toBe('en');
  });

  it('troca de idioma mantém a página e a query', () => {
    expect(switchLocalePath('/eventos', '?item=1&type=event', 'fr')).toBe(
      '/fr/evenements?item=1&type=event'
    );
    expect(switchLocalePath('/en', '', 'pt-BR')).toBe('/');
    expect(switchLocalePath('/admin', '', 'en')).toBe('/en');
  });

  it('favoritos não é indexável', () => {
    expect(INDEXABLE_ROUTE_KEYS).not.toContain('favorites');
    expect(INDEXABLE_ROUTE_KEYS).toHaveLength(7);
  });
});
