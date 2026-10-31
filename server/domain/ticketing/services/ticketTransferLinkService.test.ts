import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue(null),
  getEventOccurrenceByIdUseCase: vi.fn().mockResolvedValue({
    status: 'scheduled',
    startsAt: '2026-12-20T23:00:00.000Z',
  }),
}));

import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketTransferLink } from '../types/ticketingTypes';
import { TicketTransferLinkService } from './ticketTransferLinkService';

const NOW = new Date('2026-12-10T12:00:00.000Z').getTime();
const FROM = { username: 'ana', displayName: 'Ana Souza' };

function setup(ownerUserId = 'buyer') {
  const links = new Map<string, TicketTransferLink>();
  const port = {
    getTicketById: vi.fn().mockResolvedValue({
      id: 'tkt_1',
      orderId: 'ord_1',
      ownerUserId,
      status: 'issued',
      eventSnapshot: { title: 'Luau', startsAt: '2026-12-20T23:00:00.000Z' },
      ticketTypeSnapshot: { name: 'Pista' },
    }),
    getOrderById: vi.fn().mockResolvedValue({
      buyerId: 'buyer',
      salesPolicySnapshot: { allowTicketTransfer: true, ticketTransferCutoffHours: 4 },
    }),
    createTransferLink: vi.fn(async (link: Omit<TicketTransferLink, 'id'>) => {
      links.set('lnk_1', { ...link, id: 'lnk_1' });
      return { ...link, id: 'lnk_1' };
    }),
    getTransferLink: vi.fn(async (id: string) => links.get(id) ?? null),
    claimTransferLink: vi.fn(async (id: string) => links.get(id)),
  } as unknown as TicketingPort;
  let now = NOW;
  const service = new TicketTransferLinkService(port, () => now);
  return { port, links, service, setNow: (ms: number) => (now = ms) };
}

describe('link de transferência (D21)', () => {
  beforeEach(() => {
    process.env.TICKET_QR_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';
  });
  afterEach(() => {
    delete process.env.TICKET_QR_SECRET;
  });

  it('vale 30 min, guarda só o hash do código e mostra o ingresso a quem tem o link', async () => {
    const { service, links } = setup();
    const created = await service.create({ uid: 'buyer' }, 'tkt_1', FROM);
    expect(created.expiresAt).toBe('2026-12-10T12:30:00.000Z');
    expect(created.token.length).toBeGreaterThanOrEqual(40);
    expect(JSON.stringify([...links.values()])).not.toContain(created.token);
    await expect(service.preview('lnk_1', created.token)).resolves.toMatchObject({
      eventTitle: 'Luau',
      ticketType: 'Pista',
      from: FROM,
    });
  });

  it('código errado, link vencido e o próprio comprador são recusados', async () => {
    const { service, setNow } = setup();
    const { token } = await service.create({ uid: 'buyer' }, 'tkt_1', FROM);
    await expect(service.preview('lnk_1', 'x'.repeat(43))).rejects.toMatchObject({
      code: 'TRANSFER_LINK_INVALID',
    });
    await expect(service.claim('lnk_1', token, 'buyer')).rejects.toMatchObject({
      code: 'TRANSFER_LINK_OWN',
    });
    setNow(NOW + 31 * 60_000);
    await expect(service.claim('lnk_1', token, 'bruno')).rejects.toMatchObject({
      code: 'TRANSFER_LINK_EXPIRED',
    });
  });

  it('ingresso recebido não gera link; ingresso de outra pessoa também não', async () => {
    await expect(
      setup('bruno').service.create({ uid: 'bruno' }, 'tkt_1', FROM)
    ).rejects.toMatchObject({
      code: 'TRANSFER_ONLY_TO_BUYER',
    });
    await expect(setup().service.create({ uid: 'intruso' }, 'tkt_1', FROM)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});
