import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({ checkIn: vi.fn() }));
vi.mock('../usecases/checkInTicketUseCase', () => ({ checkInTicketUseCase: m.checkIn }));

import { TicketingController } from './ticketingController';

function response() {
  const res = { status: vi.fn(), json: vi.fn() };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res;
}

describe('TicketingController.checkInTicket (§7.9, C1)', () => {
  it('a portaria recebe só nome, lote e convidado; nunca e-mail, comprador nem hash do QR', async () => {
    m.checkIn.mockResolvedValue({
      ticket: {
        id: 't1',
        status: 'checked_in',
        holderName: 'Ana Souza',
        holderEmail: 'ana@exemplo.com',
        ownerUserId: 'buyer-1',
        orderId: 'o1',
        qrTokenHash: 'hash-secreto',
        ticketTypeSnapshot: { name: 'Pista', kind: 'paid', unitPriceMinor: 10000 },
      },
      checkIn: {
        id: 'c1',
        ticketId: 't1',
        occurrenceId: 'occ1',
        checkedInBy: 'equipe-1',
        source: 'online',
        checkedInAt: '2026-12-20T23:10:00.000Z',
      },
    });
    const res = response();
    await TicketingController.checkInTicket(
      { body: { occurrenceId: 'occ1', ticketId: 't1' }, user: { uid: 'equipe-1' } } as never,
      res as unknown as Response
    );
    expect(res.status).toHaveBeenCalledWith(200);
    const body = JSON.stringify(res.json.mock.calls[0]?.[0]);
    expect(body).toContain('"holderName":"Ana Souza"');
    expect(body).toContain('"name":"Pista"');
    for (const secret of ['ana@exemplo.com', 'buyer-1', 'hash-secreto', '10000', '"o1"']) {
      expect(body).not.toContain(secret);
    }
  });
});
