import type { EventOrderRow, PartnerOrderStatus } from './buildEventSales';

export type EventOrdersFilter = 'all' | 'refunds';

const WITH_REFUND = new Set<PartnerOrderStatus>([
  'refund_requested',
  'partially_refunded',
  'refunded',
]);

/** Minúsculas e sem acento, para "joão" achar "Joao"; o "#" do código é opcional na busca. */
export function normalizeOrderSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/^#/, '');
}

export function filterEventOrders(rows: EventOrderRow[], filter: EventOrdersFilter) {
  return filter === 'refunds' ? rows.filter((row) => WITH_REFUND.has(row.view.status)) : rows;
}

/** Código do pedido pelo começo; nome público em qualquer parte. */
export function searchEventOrders(
  rows: EventOrderRow[],
  query: string,
  names: Map<string, string | null>
) {
  const term = normalizeOrderSearch(query);
  if (!term) return rows;
  return rows.filter(
    (row) =>
      row.view.code.toLowerCase().startsWith(term) ||
      normalizeOrderSearch(names.get(row.buyerId) ?? '').includes(term)
  );
}

interface CursorPosition {
  createdAt: string;
  id: string;
}

export function encodeOrdersCursor(position: CursorPosition): string {
  return Buffer.from(`${position.createdAt}|${position.id}`, 'utf8').toString('base64url');
}

/** `null` quando o cursor não foi gerado por `encodeOrdersCursor`. */
export function decodeOrdersCursor(cursor: string): CursorPosition | null {
  const [createdAt, id, ...rest] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  if (rest.length > 0 || !createdAt || !id || Number.isNaN(Date.parse(createdAt))) return null;
  return { createdAt, id };
}

/** Página depois do cursor, na mesma ordem de `buildEventOrderRows` (mais recente primeiro). */
export function pageEventOrders(
  rows: EventOrderRow[],
  limit: number,
  after: CursorPosition | null
) {
  const start = after
    ? rows.findIndex(
        ({ view }) =>
          view.createdAt < after.createdAt ||
          (view.createdAt === after.createdAt && view.id < after.id)
      )
    : 0;
  const page = start < 0 ? [] : rows.slice(start, start + limit);
  const last = page.at(-1);
  const more = start >= 0 && start + limit < rows.length;
  return {
    page,
    nextCursor:
      more && last
        ? encodeOrdersCursor({ createdAt: last.view.createdAt, id: last.view.id })
        : null,
  };
}
