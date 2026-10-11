import { createSitemapService } from '../factory';
import type { SeoContentPort } from '../ports/seoContentPort';

export async function renderSitemapXmlUseCase(content: SeoContentPort): Promise<string> {
  return createSitemapService(content).renderXml();
}
