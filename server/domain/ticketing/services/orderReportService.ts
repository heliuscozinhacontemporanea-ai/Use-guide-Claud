import { getEventListingByIdUseCase } from '../../events';
import type { OrderReportPort } from '../ports/orderReportPort';

export interface OrderReportUnits {
  /** Ingressos que continuam valendo (sem reembolsados e cancelados). */
  tickets: number;
  /** Venda feita pelo link de um divulgador (D27). */
  viaPromoter: boolean;
}

/** Ingressos por pedido para Relatórios (p23), só dos eventos do próprio dono. */
export class OrderReportService {
  constructor(private readonly port: OrderReportPort) {}

  async summarize(ownerUid: string, orderIds: string[]): Promise<Record<string, OrderReportUnits>> {
    const ids = [...new Set(orderIds)];
    const [orders, tickets] = await Promise.all([
      this.port.getOrders(ids),
      this.port.listTicketsByOrderIds(ids),
    ]);
    const owners = new Map<string, string | null>();
    await Promise.all(
      [...new Set(orders.map((order) => order.eventListingId))].map(async (listingId) => {
        const listing = await getEventListingByIdUseCase(listingId).catch(() => null);
        owners.set(listingId, listing?.ownerId ?? null);
      })
    );
    const valid = new Map<string, number>();
    for (const ticket of tickets) {
      if (ticket.status === 'issued' || ticket.status === 'checked_in') {
        valid.set(ticket.orderId, (valid.get(ticket.orderId) ?? 0) + 1);
      }
    }
    const out: Record<string, OrderReportUnits> = {};
    for (const order of orders) {
      if (owners.get(order.eventListingId) !== ownerUid) continue;
      out[order.id] = { tickets: valid.get(order.id) ?? 0, viaPromoter: Boolean(order.promoterId) };
    }
    return out;
  }
}
