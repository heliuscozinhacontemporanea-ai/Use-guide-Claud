import type {
  PartnerCatalogEvent,
  PartnerEarnings,
  PartnerEventSales,
  PartnerHomeView,
  PartnerReportPeriod,
  PartnerReports,
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
  /** A receber, recebido no mês e repasses dos CNPJs do parceiro. */
  getEarnings(): Promise<PartnerEarnings>;
  /** Vendas do período por barra e por item. */
  getReports(period: PartnerReportPeriod): Promise<PartnerReports>;
  /** Devolve os cartões gravados, na ordem. */
  saveCards(cards: string[]): Promise<string[]>;
}
