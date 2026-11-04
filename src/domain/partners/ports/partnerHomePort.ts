import type { PartnerCatalogEvent, PartnerHomeView, PartnerTodayItem } from '../types/partnerHome';

export interface PartnerHomePort {
  get(): Promise<PartnerHomeView>;
  /** Horários e sessões do dono em [from, to). */
  getAgenda(fromIso: string, toIso: string): Promise<PartnerTodayItem[]>;
  /** Eventos do dono para o Catálogo. */
  getCatalogEvents(): Promise<PartnerCatalogEvent[]>;
  /** Devolve os cartões gravados, na ordem. */
  saveCards(cards: string[]): Promise<string[]>;
}
