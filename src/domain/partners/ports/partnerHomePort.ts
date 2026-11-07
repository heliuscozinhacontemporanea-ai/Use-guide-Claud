import type {
  PartnerCatalogEvent,
  PartnerEarnings,
  PartnerEventOrdersPage,
  PartnerEventOrdersQuery,
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
  /** Vendas e sessões de um evento do dono. */
  getEventSales(eventId: string): Promise<PartnerEventSales>;
  /** Pedidos do evento, por página, com busca por nome ou código e filtro de reembolso. */
  listEventOrders(eventId: string, query: PartnerEventOrdersQuery): Promise<PartnerEventOrdersPage>;
  /** A receber, recebido no mês e repasses dos CNPJs do parceiro. */
  getEarnings(): Promise<PartnerEarnings>;
  /** Vendas do período por barra e por item. */
  getReports(period: PartnerReportPeriod): Promise<PartnerReports>;
  /** Devolve os cartões gravados, na ordem. */
  saveCards(cards: string[]): Promise<string[]>;
  /** Tour concluído ou "Não mostrar novamente" (etapa 6). */
  completeTour(): Promise<void>;
}
