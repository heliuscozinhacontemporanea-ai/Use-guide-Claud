import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LISTING = {
  id: 'ev1',
  ownerId: 'partner',
  title: 'Luau na Duna',
  establishmentId: 'it1',
  location: { name: 'Jericoacoara' },
};
const OCCURRENCE = {
  id: 'oc1',
  eventListingId: 'ev1',
  status: 'scheduled',
  startsAt: '2026-12-20T23:00:00.000Z',
  endsAt: '2026-12-21T04:00:00.000Z',
  capacity: 300,
};

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn(async (id: string) => (id === 'ev1' ? LISTING : null)),
  getEventOccurrenceByIdUseCase: vi.fn(async (id: string) => (id === 'oc1' ? OCCURRENCE : null)),
}));

import { CourtesyError } from '../errors/courtesyError';
import type { CourtesyStorePort, IssueCourtesyInput } from '../ports/courtesyStorePort';
import type { TicketingPort } from '../ports/ticketingPort';
import type { EventCourtesy } from '../types/courtesyTypes';
import { CourtesyService } from './courtesyService';

const NOW = new Date('2026-12-10T12:00:00.000Z').getTime();
const BIA = {
  uid: 'bia',
  username: 'bia.reis',
  displayName: 'Bia Reis',
  holderName: 'Bia Reis',
  holderEmail: 'bia@example.com',
};

function setup(opts: { orders?: unknown[]; tickets?: unknown[] } = {}) {
  const courtesies = new Map<string, EventCourtesy>();
  const issued: IssueCourtesyInput[] = [];
  const store: CourtesyStorePort = {
    issue: vi.fn(async (input: IssueCourtesyInput) => {
      issued.push(input);
      const id = `c${courtesies.size + 1}`;
      const courtesy: EventCourtesy = {
        id,
        eventListingId: input.eventListingId,
        occurrenceId: input.occurrenceId,
        invitedBy: input.invitedBy,
        channel: input.channel,
        status: input.guest ? 'issued' : 'pending_link',
        guest: input.guest,
        ticketId: input.guest ? `t-${id}` : null,
        linkTokenHash: input.linkTokenHash,
        linkExpiresAt: input.linkExpiresAt,
        createdAt: input.nowIso,
        updatedAt: input.nowIso,
        claimedAt: null,
        canceledAt: null,
      };
      courtesies.set(id, courtesy);
      return courtesy;
    }),
    claimLink: vi.fn(async (input) => {
      const current = courtesies.get(input.courtesyId)!;
      const next = { ...current, status: 'issued' as const, guest: input.guest, ticketId: 't-x' };
      courtesies.set(current.id, next);
      return next;
    }),
    cancel: vi.fn(async (id: string) => ({ ...courtesies.get(id)!, status: 'canceled' as const })),
    get: vi.fn(async (id: string) => courtesies.get(id) ?? null),
    listByEvent: vi.fn(async () => [...courtesies.values()]),
    countHeldByOccurrence: vi.fn(async () => courtesies.size),
    anonymizeGuest: vi.fn(async () => 0),
  };
  const port = {
    listOrdersByBuyerId: vi.fn(async () => opts.orders ?? []),
    listTicketsByOwnerUserId: vi.fn(async () => opts.tickets ?? []),
    getTicketById: vi.fn(async (id: string) =>
      id === 't-c1' ? { id, status: 'checked_in', checkedInAt: '2026-12-20T23:14:00.000Z' } : null
    ),
  } as unknown as TicketingPort;
  let now = NOW;
  const service = new CourtesyService(store, port, () => now);
  return { service, store, issued, courtesies, setNow: (ms: number) => (now = ms) };
}

const PARTNER = { uid: 'partner' };

describe('cortesias (D27)', () => {
  beforeEach(() => {
    process.env.TICKET_QR_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';
  });
  afterEach(() => {
    delete process.env.TICKET_QR_SECRET;
  });

  it('pelo @: emite o ingresso nominal com nome e e-mail da conta, sem preço', async () => {
    const { service, issued } = setup();
    const courtesy = await service.inviteByUsername(PARTNER, 'oc1', BIA);
    expect(courtesy.status).toBe('issued');
    expect(issued[0]).toMatchObject({
      occurrenceCapacity: 300,
      channel: 'username',
      guest: { uid: 'bia', username: 'bia.reis' },
      ticket: { holderName: 'Bia Reis', holderEmail: 'bia@example.com' },
    });
    expect(issued[0]?.ticket?.qrTokenHash).toBeTruthy();
  });

  it('só o dono do evento convida (outro parceiro recebe 403)', async () => {
    const { service } = setup();
    await expect(service.inviteByUsername({ uid: 'outro' }, 'oc1', BIA)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('recusa o próprio organizador e quem comprou, cancelou ou foi reembolsado no evento', async () => {
    await expect(
      setup().service.inviteByUsername(PARTNER, 'oc1', { ...BIA, uid: 'partner' })
    ).rejects.toMatchObject({ code: 'COURTESY_SELF' });
    for (const status of ['paid', 'canceled', 'refunded', 'partially_refunded']) {
      const { service } = setup({ orders: [{ eventListingId: 'ev1', status }] });
      await expect(service.inviteByUsername(PARTNER, 'oc1', BIA)).rejects.toMatchObject({
        code: 'COURTESY_GUEST_HAS_PURCHASE',
      });
    }
    const transferred = setup({
      tickets: [{ eventListingId: 'ev1', status: 'issued' }],
    });
    await expect(transferred.service.inviteByUsername(PARTNER, 'oc1', BIA)).rejects.toBeInstanceOf(
      CourtesyError
    );
  });

  it('pedido nunca pago e compra de outro evento não impedem a cortesia', async () => {
    const { service } = setup({
      orders: [
        { eventListingId: 'ev1', status: 'expired' },
        { eventListingId: 'ev1', status: 'payment_failed' },
        { eventListingId: 'ev2', status: 'paid' },
      ],
    });
    await expect(service.inviteByUsername(PARTNER, 'oc1', BIA)).resolves.toMatchObject({
      status: 'issued',
    });
  });

  it('pelo @ vale até o fim da sessão; o link só até o início', async () => {
    const { service, setNow } = setup();
    setNow(new Date('2026-12-21T00:00:00.000Z').getTime());
    await expect(service.createLink(PARTNER, 'oc1')).rejects.toMatchObject({
      code: 'COURTESY_SESSION_CLOSED',
    });
    await expect(service.inviteByUsername(PARTNER, 'oc1', BIA)).resolves.toBeTruthy();
    setNow(new Date('2026-12-21T04:00:00.000Z').getTime());
    await expect(service.inviteByUsername(PARTNER, 'oc1', BIA)).rejects.toMatchObject({
      code: 'COURTESY_SESSION_CLOSED',
    });
  });

  it('link: guarda só o hash, mostra o evento e é resgatado uma vez por quem pode receber', async () => {
    const { service, courtesies, setNow } = setup();
    const link = await service.createLink(PARTNER, 'oc1');
    expect(link.expiresAt).toBe(OCCURRENCE.startsAt);
    expect(JSON.stringify([...courtesies.values()])).not.toContain(link.token);
    await expect(service.preview(link.courtesyId, 'x'.repeat(43))).rejects.toMatchObject({
      code: 'COURTESY_LINK_INVALID',
    });
    await expect(service.preview(link.courtesyId, link.token)).resolves.toMatchObject({
      eventTitle: 'Luau na Duna',
      establishmentId: 'it1',
      locationName: 'Jericoacoara',
    });
    await expect(service.claim(link.courtesyId, link.token, BIA)).resolves.toMatchObject({
      status: 'issued',
      guest: { uid: 'bia' },
    });
    await expect(service.claim(link.courtesyId, link.token, BIA)).rejects.toMatchObject({
      code: 'COURTESY_LINK_INVALID',
    });

    const other = await service.createLink(PARTNER, 'oc1');
    setNow(new Date(OCCURRENCE.startsAt).getTime());
    await expect(service.claim(other.courtesyId, other.token, BIA)).rejects.toMatchObject({
      code: 'COURTESY_LINK_EXPIRED',
    });
  });

  it('lista com a situação de cada um e só para o dono (404 para outro)', async () => {
    const { service } = setup();
    await service.inviteByUsername(PARTNER, 'oc1', BIA);
    await service.createLink(PARTNER, 'oc1');
    const rows = await service.listForEvent(PARTNER, 'ev1');
    expect(rows.map((row) => row.status)).toEqual(['checked_in', 'link_pending']);
    expect(rows[0]).toMatchObject({ checkedInAt: '2026-12-20T23:14:00.000Z' });
    expect(JSON.stringify(rows)).not.toContain('bia@example.com');
    await expect(service.listForEvent({ uid: 'outro' }, 'ev1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(service.cancel({ uid: 'outro' }, 'c1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('sessão cancelada cancela as cortesias dela e devolve as que tinham pessoa', async () => {
    const { service, store } = setup();
    await service.inviteByUsername(PARTNER, 'oc1', BIA);
    await service.createLink(PARTNER, 'oc1');
    const canceled = await service.cancelAllForOccurrence(PARTNER, 'oc1');
    expect(store.cancel).toHaveBeenCalledTimes(2);
    expect(canceled.map((courtesy) => courtesy.guest?.uid)).toEqual(['bia']);
  });
});
