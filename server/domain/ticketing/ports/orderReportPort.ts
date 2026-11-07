import type { Ticket, TicketOrder } from '../types/ticketingTypes';

/** Leituras em lote para Relatórios (p23). */
export interface OrderReportPort {
  getOrders(orderIds: string[]): Promise<TicketOrder[]>;
  listTicketsByOrderIds(orderIds: string[]): Promise<Ticket[]>;
}
