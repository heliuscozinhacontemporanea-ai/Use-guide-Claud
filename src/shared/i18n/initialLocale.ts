import { DEFAULT_LOCALE, type Locale, resolvePreferredLocale } from './locale';
import { localizedPath, parseLocalizedPath } from './localizedRoutes';

const CRAWLER_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|embedly|preview|lighthouse/i;

/** Robôs de busca e de pré-visualização de link nunca são redirecionados nem veem o aviso (decisão D10). */
export function isCrawler(userAgent: string): boolean {
  return CRAWLER_PATTERN.test(userAgent);
}

function isBareHome(pathname: string, search: string): boolean {
  if (pathname !== localizedPath('explore', DEFAULT_LOCALE)) return false;
  // Parâmetros de campanha não tornam o link um conteúdo específico; `?item=` e afins tornam.
  return [...new URLSearchParams(search).keys()].every((key) => key.startsWith('utm_'));
}

/**
 * Destino da home `/` na primeira carga, ou `null` para ficar onde está. Links para conteúdo em
 * português não são redirecionados: mostram o aviso de idioma (`suggestedLocaleFor`).
 */
export function resolveHomeRedirect(
  pathname: string,
  search: string,
  userAgent: string,
  preferred: Locale = resolvePreferredLocale()
): string | null {
  if (preferred === DEFAULT_LOCALE || isCrawler(userAgent) || !isBareHome(pathname, search)) {
    return null;
  }
  return `${localizedPath('explore', preferred)}${search}`;
}

/** Idioma inicial: URL com idioma → (home) preferência → idioma da página → preferência. */
export function resolveInitialLocale(pathname: string, search: string, userAgent: string): Locale {
  const preferred = resolvePreferredLocale();
  if (resolveHomeRedirect(pathname, search, userAgent, preferred)) return preferred;
  return parseLocalizedPath(pathname)?.locale ?? preferred;
}

/** Idioma a sugerir numa página em português aberta por link, ou `null` quando não há aviso. */
export function suggestedLocaleFor(
  pathname: string,
  userAgent: string,
  preferred: Locale = resolvePreferredLocale()
): Locale | null {
  if (preferred === DEFAULT_LOCALE || isCrawler(userAgent)) return null;
  return parseLocalizedPath(pathname)?.locale === DEFAULT_LOCALE ? preferred : null;
}
