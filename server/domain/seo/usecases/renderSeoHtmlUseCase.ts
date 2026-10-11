import { createSeoHtmlService } from '../factory';
import type { SeoContentPort } from '../ports/seoContentPort';

/**
 * HTML do app com metadados, canonical e JSON-LD da rota. Não contém dado de usuário: é cacheado na CDN.
 * O conteúdo do catálogo entra pelo port, porque seo é folha e não importa outros domínios.
 */
export async function renderSeoHtmlUseCase(
  params: { path: string; query: Record<string, unknown> },
  content: SeoContentPort
): Promise<string> {
  return createSeoHtmlService(content).renderHtml(params.path, params.query);
}
