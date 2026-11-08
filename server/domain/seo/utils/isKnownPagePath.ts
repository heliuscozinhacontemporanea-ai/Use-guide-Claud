import { parseLocalizedPath } from '../../../shared/kernel/localizedRoutes';
import { NON_LOCALIZED_ROUTE_SEO } from './routeSeo';

/**
 * Se o caminho é uma página do app (rotas por idioma ou fora do mapa). Os outros recebem status 404
 * para o Google não tratar a página "não encontrada" como conteúdo (soft 404).
 */
export function isKnownPagePath(path: string): boolean {
  const normalized = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return (
    parseLocalizedPath(normalized) !== null || Object.hasOwn(NON_LOCALIZED_ROUTE_SEO, normalized)
  );
}
