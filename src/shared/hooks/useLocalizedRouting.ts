import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type NavigateOptions, useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_LOCALE,
  type Locale,
  localizedPath,
  normalizeLocale,
  parseLocalizedPath,
  type RouteKey,
  switchLocalePath,
} from '../i18n';

/** Navegação pelas chaves de rota no idioma ativo (decisão D6). Nunca use caminhos fixos como '/eventos'. */
export function useLocalizedRouting() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const parsed = parseLocalizedPath(location.pathname);
  const locale: Locale =
    parsed?.locale ?? normalizeLocale(i18n.resolvedLanguage ?? i18n.language) ?? DEFAULT_LOCALE;

  const pathFor = useCallback((routeKey: RouteKey) => localizedPath(routeKey, locale), [locale]);

  const goTo = useCallback(
    (routeKey: RouteKey, search = '', options?: NavigateOptions) =>
      navigate(`${localizedPath(routeKey, locale)}${search}`, options),
    [navigate, locale]
  );

  const switchLocale = useCallback(
    (target: Locale) => {
      if (parsed) {
        navigate(switchLocalePath(location.pathname, location.search, target));
      }
      void i18n.changeLanguage(target);
    },
    [parsed, navigate, location.pathname, location.search, i18n]
  );

  return { locale, routeKey: parsed?.routeKey ?? null, pathFor, goTo, switchLocale };
}

/** Mantém o idioma ativo igual ao da URL; rotas fora do mapa (/admin, /checkout/result) não mudam o idioma. */
export function useSyncLocaleWithUrl(): void {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();
  const urlLocale = parseLocalizedPath(pathname)?.locale ?? null;

  useEffect(() => {
    if (urlLocale && normalizeLocale(i18n.language) !== urlLocale) {
      void i18n.changeLanguage(urlLocale);
    }
  }, [urlLocale, i18n]);
}
