import type {
  PartnerCatalogEvent,
  PartnerEventSales,
  PartnerHomeView,
  PartnerTodayItem,
} from '../types/partnerHome';

export interface PartnerHomePort {
  get(): Promise<PartnerHomeView>;
  /** Horários e sessões do dono em [from, to). */
  getAgenda(fromIso: string, toIso: string): Promise<PartnerTodayItem[]>;
  /** Eventos do dono para o Catálogo. */
  getCatalogEvents(): Promise<PartnerCatalogEvent[]>;
  /** Vendas, sessões e pedidos de um evento do dono. */
  getEventSales(eventId: string): Promise<PartnerEventSales>;
  /** Devolve os cartões gravados, na ordem. */
  saveCards(cards: string[]): Promise<string[]>;
}
