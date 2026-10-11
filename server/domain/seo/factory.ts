import { FileHtmlTemplateAdapter } from './adapters/fileHtmlTemplateAdapter';
import type { SeoContentPort } from './ports/seoContentPort';
import { SeoHtmlService } from './services/seoHtmlService';
import { SitemapService } from './services/sitemapService';

let templateAdapter: FileHtmlTemplateAdapter | null = null;

export function createSeoHtmlService(content: SeoContentPort): SeoHtmlService {
  templateAdapter ??= new FileHtmlTemplateAdapter();
  return new SeoHtmlService(content, templateAdapter);
}

export function createSitemapService(content: SeoContentPort): SitemapService {
  return new SitemapService(content);
}
