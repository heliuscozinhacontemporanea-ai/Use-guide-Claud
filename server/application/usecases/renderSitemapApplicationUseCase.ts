import { renderSitemapXmlUseCase } from '../../domain/seo';
import { CatalogSeoContentProvider } from '../seo/catalogSeoContentProvider';

const catalogContent = new CatalogSeoContentProvider();

export async function renderSitemapApplicationUseCase(): Promise<string> {
  return renderSitemapXmlUseCase(catalogContent);
}
