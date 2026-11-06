import { getEventListingByIdUseCase, listEventOccurrencesUseCase } from '../../../domain/events';
import { listPayoutEntriesForReferencesUseCase } from '../../../domain/payment';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
  listEventTicketsForPartnerOrAdminUseCase,
} from '../../../domain/ticketing';
import { getUserPublicProfileUseCase } from '../../../domain/users';
import { buildCatalogEvents, type PartnerCatalogEvent } from './buildCatalogEvents';
import { buildEventSales, type PartnerEventOrderView } from './buildEventSales';
import { toSessionInput } from './partnerSessions';

export interface PartnerEventSalesView {
  event: Pick<PartnerCatalogEvent, 'id' | 'title' | 'status' | 'sessions'>;
  soldMinor: number;
  ticketsSold: number;
  receiveMinor: number;
  sessions: Array<{
    id: string;
    startsAt: string;
    sold: number;
    capacity: number;
    courtesies: number;
  }>;
  orders: PartnerEventOrderView[];
  ordersTotal: number;
}

/**
 * Página do evento · Vendas (p10, p11). A posse é conferida pelos casos de uso do ticketing
 * (dono do evento); a resposta leva o nome público do comprador e nunca o e-mail ou o documento.
 */
export async function getPartnerEventSalesApplicationUseCase(
  ownerUid: string,
  eventId: string,
  now: Date = new Date()
): Promise<PartnerEventSalesView> {
  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  // Pedidos primeiro: lança FORBIDDEN ou NOT_FOUND antes de ler qualquer outra coisa.
  const orders = await listEventOrdersForPartnerOrAdminUseCase(actor, eventId);
  const [event, occurrences, tickets, refunds, entries] = await Promise.all([
    getEventListingByIdUseCase(eventId),
    listEventOccurrencesUseCase(eventId),
    listEventTicketsForPartnerOrAdminUseCase(actor, eventId),
    listEventRefundsForPartnerOrAdminUseCase(actor, eventId),
    listPayoutEntriesForReferencesUseCase(
      'ticket_order',
      orders.map((order) => order.id)
    ),
  ]);
  if (!event) throw new Error('EVENT_NOT_FOUND');

  const live = occurrences.filter((occurrence) => occurrence.status !== 'canceled');
  const buyers = [...new Set(orders.map((order) => order.buyerId))];
  const [sessions, names] = await Promise.all([
    Promise.all(live.map((occurrence) => toSessionInput(ownerUid, { event, occurrence }))),
    Promise.all(
      buyers.map(
        async (uid) =>
          [
            uid,
            (await getUserPublicProfileUseCase(uid).catch(() => null))?.displayName ?? null,
          ] as const
      )
    ),
  ]);
  const [summary] = buildCatalogEvents([{ event, occurrences, sold: 0 }], now.toISOString());

  return {
    event: {
      id: event.id,
      title: event.title || event.name,
      status: summary?.status ?? 'published',
      sessions: live.length,
    },
    sessions: sessions
      .map((session) => ({
        id: session.id,
        startsAt: session.startsAt,
        sold: session.sold,
        capacity: session.capacity,
        courtesies: session.courtesies,
      }))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    ...buildEventSales({ orders, tickets, refunds, entries, names: new Map(names) }),
  };
}
