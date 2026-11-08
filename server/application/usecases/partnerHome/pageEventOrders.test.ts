import { describe, expect, it } from 'vitest';
import type { EventOrderRow, PartnerOrderStatus } from './buildEventSales';
import {
  decodeOrdersCursor,
  encodeOrdersCursor,
  filterEventOrders,
  pageEventOrders,
  searchEventOrders,
} from './pageEventOrders';

function row(id: string, createdAt: string, status: PartnerOrderStatus = 'paid'): EventOrderRow {
  return {
    buyerId: `buyer-${id}`,
    view: { id, code: id.slice(0, 6), createdAt, status } as EventOrderRow['view'],
  };
}

const rows = [
  row('Xa12bc99', '2026-11-05T12:00:00.000Z', 'refund_requested'),
  row('Yb34', '2026-11-04T12:00:00.000Z'),
  row('Zc56', '2026-11-04T12:00:00.000Z', 'refunded'),
  row('Ab78', '2026-11-03T12:00:00.000Z', 'partially_refunded'),
  row('Bd90', '2026-11-02T12:00:00.000Z', 'disputed'),
];
// Mesma hora: o desempate é pelo ID, do maior para o menor, como em buildEventOrderRows.
const sorted = [rows[0]!, rows[2]!, rows[1]!, rows[3]!, rows[4]!];

describe('pageEventOrders', () => {
  it('pagina por cursor sem repetir nem pular pedidos com a mesma hora', () => {
    const first = pageEventOrders(sorted, 2, null);
    expect(first.page.map((r) => r.view.id)).toEqual(['Xa12bc99', 'Zc56']);
    const second = pageEventOrders(sorted, 2, decodeOrdersCursor(first.nextCursor!));
    expect(second.page.map((r) => r.view.id)).toEqual(['Yb34', 'Ab78']);
    const third = pageEventOrders(sorted, 2, decodeOrdersCursor(second.nextCursor!));
    expect(third.page.map((r) => r.view.id)).toEqual(['Bd90']);
    expect(third.nextCursor).toBeNull();
  });

  it('cursor que não veio do servidor é recusado', () => {
    expect(decodeOrdersCursor('lixo')).toBeNull();
    expect(decodeOrdersCursor(Buffer.from('a|b|c').toString('base64url'))).toBeNull();
    const cursor = encodeOrdersCursor({ createdAt: '2026-11-04T12:00:00.000Z', id: 'Yb34' });
    expect(decodeOrdersCursor(cursor)).toEqual({
      createdAt: '2026-11-04T12:00:00.000Z',
      id: 'Yb34',
    });
  });

  it('"Com reembolso" mostra pedido, parcial e total; disputa fica de fora', () => {
    expect(filterEventOrders(sorted, 'refunds').map((r) => r.view.id)).toEqual([
      'Xa12bc99',
      'Zc56',
      'Ab78',
    ]);
    expect(filterEventOrders(sorted, 'all')).toHaveLength(5);
  });

  it('busca pelo começo do código, com ou sem "#", e pelo nome sem acento', () => {
    const names = new Map<string, string | null>([
      ['buyer-Yb34', 'João Silva'],
      ['buyer-Zc56', 'Ana'],
      ['buyer-Ab78', null],
    ]);
    expect(searchEventOrders(sorted, '#xa12', names).map((r) => r.view.id)).toEqual(['Xa12bc99']);
    expect(searchEventOrders(sorted, 'joao', names).map((r) => r.view.id)).toEqual(['Yb34']);
    expect(searchEventOrders(sorted, 'SILV', names).map((r) => r.view.id)).toEqual(['Yb34']);
    // "a1" só no meio do código não conta.
    expect(searchEventOrders(sorted, '12', names)).toEqual([]);
    expect(searchEventOrders(sorted, '  ', names)).toHaveLength(5);
  });
});
