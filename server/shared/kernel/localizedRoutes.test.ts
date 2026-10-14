import { describe, expect, it } from 'vitest';
import * as frontendLocale from '../../../src/shared/i18n/locale';
import * as frontendRoutes from '../../../src/shared/i18n/localizedRoutes';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale';
import * as backendRoutes from './localizedRoutes';

describe('paridade frontend × backend', () => {
  it('idiomas suportados e padrão são iguais', () => {
    expect([...SUPPORTED_LOCALES]).toEqual([...frontendLocale.SUPPORTED_LOCALES]);
    expect(DEFAULT_LOCALE).toBe(frontendLocale.DEFAULT_LOCALE);
  });

  it('mapa de rotas por idioma é igual', () => {
    expect(backendRoutes.LOCALIZED_ROUTES).toEqual(frontendRoutes.LOCALIZED_ROUTES);
    expect([...backendRoutes.ROUTE_KEYS]).toEqual([...frontendRoutes.ROUTE_KEYS]);
  });
});
