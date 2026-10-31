import { describe, expect, it, vi } from 'vitest';

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue({ id: 'evt_1', ownerId: 'partner_1' }),
  getEventOccurrenceByIdUseCase: vi.fn().mockResolvedValue({
    id: 'occ_1',
    eventListingId: 'evt_1',
    startsAt: '2026-12-20T23:00:00.000Z',
    endsAt: '2026-12-21T05:00:00.000Z',
    salesEndsAt: '2026-12-20T21:00:00.000Z',
  }),
  createEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
}));

import type { TicketingPort } from '../ports/ticketingPort';
import type { TicketQrTokenPort } from '../ports/ticketQrTokenPort';
import { hashTicketIdForOfflineManifest } from '../utils/offlineManifest';
import { OfflineCheckInService } from './offlineCheckInService';

const PARTNER = { uid: 'partner_1', admin: false };

function setup() {
  const port = {
    listTicketsByOccurrenceId: vi.fn().mockResolvedValue([]),
    createOfflineCheckInSession: vi.fn(async (session: object) => ({ id: 'sess_1', ...session })),
    getOfflineCheckInSessionById: vi
      .fn()
      .mockResolvedValue({ id: 'sess_1', occurrenceId: 'occ_1' }),
    listTicketsChangedSince: vi.fn().mockResolvedValue([
      { id: 'tkt_1', qrVersion: 2, status: 'issued', updatedAt: '2026-12-20T22:01:00.000Z' },
      { id: 'tkt_2', qrVersion: 1, status: 'checked_in', updatedAt: '2026-12-20T22:02:00.000Z' },
    ]),
  } as unknown as TicketingPort;
  const qr = {
    publicKeys: () => [{ kid: 'tq1', publicKeyJwk: {} }],
  } as unknown as TicketQrTokenPort;
  return { port, service: new OfflineCheckInService(port, qr) };
}

describe('lista sem internet da portaria (D21)', () => {
  it('só pode ser preparada depois do fim das vendas pelo app', async () => {
    const { service } = setup();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-12-20T20:00:00.000Z'));
    await expect(
      service.prepareOfflineCheckInSession(PARTNER, { occurrenceId: 'occ_1' })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    vi.setSystemTime(new Date('2026-12-20T21:30:00.000Z'));
    await expect(
      service.prepareOfflineCheckInSession(PARTNER, { occurrenceId: 'occ_1' })
    ).resolves.toMatchObject({ manifest: { keys: [{ kid: 'tq1' }] } });
    vi.useRealTimers();
  });

  it('mudanças trazem só hash, versão e se o ingresso ainda vale', async () => {
    const { service } = setup();
    const changes = await service.listOfflineChanges(PARTNER, {
      sessionId: 'sess_1',
      since: '2026-12-20T22:00:00.000Z',
    });
    expect(changes.tickets).toEqual([
      { ticketIdHash: hashTicketIdForOfflineManifest('tkt_1'), qrVersion: 2, usable: true },
      { ticketIdHash: hashTicketIdForOfflineManifest('tkt_2'), qrVersion: 1, usable: false },
    ]);
    await expect(
      service.listOfflineChanges(
        { uid: 'partner_2', admin: false },
        { sessionId: 'sess_1', since: '' }
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
