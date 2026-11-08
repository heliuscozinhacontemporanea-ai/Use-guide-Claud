import {
  getEventPromotersUseCase,
  listEventOrdersForPartnerOrAdminUseCase,
  listEventRefundsForPartnerOrAdminUseCase,
  listEventTicketsForPartnerOrAdminUseCase,
} from '../../../domain/ticketing';
import { getUserPublicProfileUseCase } from '../../../domain/users';
import { buildEventOrderRows, type PartnerEventOrderView } from './buildEventSales';
import {
  decodeOrdersCursor,
  type EventOrdersFilter,
  filterEventOrders,
  pageEventOrders,
  searchEventOrders,
} from './pageEventOrders';

export interface PartnerEventOrdersQuery {
  limit: number;
  cursor?: string;
  q?: string;
  filter: EventOrdersFilter;
}

export interface PartnerEventOrdersPage {
  data: PartnerEventOrderView[];
  nextCursor: string | null;
  /** Pedidos que atendem ao filtro e à busca, em todas as páginas. */
  total: number;
}

async function publicNames(uids: string[], known: Map<string, string | null>) {
  const missing = [...new Set(uids)].filter((uid) => !known.has(uid));
  const found = await Promise.all(
    missing.map(
      async (uid) =>
        [
          uid,
          (await getUserPublicProfileUseCase(uid).catch(() => null))?.displayName ?? null,
        ] as const
    )
  );
  for (const [uid, name] of found) known.set(uid, name);
  return known;
}

/**
 * Pedidos da página do evento (p11), por página, com busca por código ou nome público e o
 * filtro "Com reembolso". A posse é conferida pelo ticketing; nunca sai e-mail nem documento.
 */
export async function listPartnerEventOrdersApplicationUseCase(
  ownerUid: string,
  eventId: string,
  query: PartnerEventOrdersQuery
): Promise<PartnerEventOrdersPage> {
  const after = query.cursor ? decodeOrdersCursor(query.cursor) : null;
  if (query.cursor && !after) throw new Error('INVALID_CURSOR');

  const actor = { uid: ownerUid, admin: false, role: 'partner' as const };
  // Pedidos primeiro: lança FORBIDDEN ou NOT_FOUND antes de ler qualquer outra coisa.
  const orders = await listEventOrdersForPartnerOrAdminUseCase(actor, eventId);
  const [tickets, refunds, promoters] = await Promise.all([
    listEventTicketsForPartnerOrAdminUseCase(actor, eventId),
    listEventRefundsForPartnerOrAdminUseCase(actor, eventId),
    getEventPromotersUseCase(actor, eventId).catch(() => ({ rows: [] })),
  ]);
  const rows = filterEventOrders(
    buildEventOrderRows({
      orders,
      tickets,
      refunds,
      promoters: new Map(promoters.rows.map((row) => [row.id, row.promoter.username])),
    }),
    query.filter
  );

  // Sem busca, só os nomes da página são lidos; com busca, os de todos os compradores do filtro.
  const names = new Map<string, string | null>();
  const term = query.q?.trim() ?? '';
  if (term) {
    await publicNames(
      rows.map((row) => row.buyerId),
      names
    );
  }
  const matched = term ? searchEventOrders(rows, term, names) : rows;
  const { page, nextCursor } = pageEventOrders(matched, query.limit, after);
  await publicNames(
    page.map((row) => row.buyerId),
    names
  );

  return {
    data: page.map((row) => ({ ...row.view, buyerName: names.get(row.buyerId) ?? null })),
    nextCursor,
    total: matched.length,
  };
}
