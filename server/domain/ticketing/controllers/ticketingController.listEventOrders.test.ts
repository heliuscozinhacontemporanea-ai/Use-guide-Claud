import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ list: vi.fn() }));
vi.mock('../usecases/listEventOrdersForPartnerOrAdminUseCase', () => ({
  listEventOrdersForPartnerOrAdminUseCase: m.list,
}));

import { TicketingController } from './ticketingController';

const ORDER = {
  id: 'o1',
  eventListingId: 'ev1',
  occurrenceId: 'occ1',
  status: 'paid',
  totalMinor: 10300,
  buyerId: 'buyer-1',
  buyerSnapshot: { name: 'Ana Souza Lima', email: 'ana@exemplo.com', document: '12345678900' },
  createdAt: '2026-11-04T12:00:00.000Z',
};

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

describe('TicketingController.listEventOrders (§7.9)', () => {
  it('parceiro recebe o pedido sem nome, e-mail, documento nem uid do comprador', async () => {
    m.list.mockResolvedValue([ORDER]);
    const res = response();
    await TicketingController.listEventOrders(
      { params: { id: 'ev1' }, user: { uid: 'owner-1' } } as never,
      res as unknown as Response
    );
    const body = JSON.stringify(res.json.mock.calls[0]?.[0]);
    expect(body).toContain('"id":"o1"');
    for (const secret of ['ana@exemplo.com', '12345678900', 'Ana Souza Lima', 'buyer-1']) {
      expect(body).not.toContain(secret);
    }
  });

  it('admin continua vendo o pedido completo', async () => {
    m.list.mockResolvedValue([ORDER]);
    const res = response();
    await TicketingController.listEventOrders(
      { params: { id: 'ev1' }, user: { uid: 'admin-1', admin: true } } as never,
      res as unknown as Response
    );
    expect(JSON.stringify(res.json.mock.calls[0]?.[0])).toContain('ana@exemplo.com');
  });
});
