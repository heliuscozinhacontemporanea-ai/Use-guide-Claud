import { renderSeoHtmlUseCase } from '../../domain/seo';
import { CatalogSeoContentProvider } from '../seo/catalogSeoContentProvider';

const catalogContent = new CatalogSeoContentProvider();

export async function renderSeoPageApplicationUseCase(params: {
  path: string;
  query: Record<string, unknown>;
}): Promise<string> {
  return renderSeoHtmlUseCase(params, catalogContent);
}
