import { getEventListingByIdUseCase, listEventOccurrencesUseCase } from '../../../domain/events';
import { listPayoutEntriesForReferencesUseCase } from '../../../domain/payment';
import {
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
  listEventTicketsForPartnerOrAdminUseCase,
} from '../../../domain/ticketing';
import { buildCatalogEvents, type PartnerCatalogEvent } from './buildCatalogEvents';
import { listPartnerPaymentAccountsApplicationUseCase } from '../paymentAccounts/listPartnerPaymentAccountsApplicationUseCase';
import { buildEventSales, type EventSalesBreakdown } from './buildEventSales';
import { toSessionInput } from './partnerSessions';

export interface PartnerEventSalesView {
  event: Pick<PartnerCatalogEvent, 'id' | 'title' | 'status' | 'sessions'>;
  soldMinor: number;
  ticketsSold: number;
  receiveMinor: number;
  /** A conta de "Você recebe" (A4). */
  breakdown: EventSalesBreakdown;
  /** CNPJ mascarado da conta que recebe o repasse; `null` enquanto não há venda. */
  payoutDocument: string | null;
  sessions: Array<{
    id: string;
    startsAt: string;
    sold: number;
    capacity: number;
    courtesies: number;
  }>;
  /** Pedidos mostrados na página; a lista vem por `listPartnerEventOrdersApplicationUseCase`. */
  ordersTotal: number;
}

/**
 * Página do evento · Vendas (p10, p11): totais e sessões. A posse é conferida pelos casos de uso
 * do ticketing (dono do evento).
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
  const sessions = await Promise.all(
    live.map((occurrence) => toSessionInput(ownerUid, { event, occurrence }))
  );
  const accountKey = entries[0]?.accountKey;
  const payoutDocument = accountKey
    ? ((await listPartnerPaymentAccountsApplicationUseCase(ownerUid)).find(
        (account) => account.accountKey === accountKey
      )?.maskedDocument ?? null)
    : null;
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
    ...buildEventSales({ orders, tickets, refunds, entries }),
    payoutDocument,
  };
}
