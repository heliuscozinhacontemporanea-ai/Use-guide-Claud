import type { SeoEvent, SeoGuideItem, SeoSitemapEntry } from '../types/seoTypes';

/** Conteúdo público do catálogo usado para montar metadados e sitemap. */
export interface SeoContentPort {
  /** Item ativo do guia, ou `null` se não existir ou estiver inativo. */
  getGuideItem(id: string): Promise<SeoGuideItem | null>;
  /** Evento publicado e público, ou `null`. */
  getEvent(id: string): Promise<SeoEvent | null>;
  listIndexableEntries(): Promise<SeoSitemapEntry[]>;
}
