import crypto from 'crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  Ed25519TicketQrTokenAdapter,
  resetTicketQrKeysForTests,
} from '../adapters/ed25519TicketQrTokenAdapter';
import type { TicketingPort } from '../ports/ticketingPort';
import type { Ticket } from '../types/ticketingTypes';
import { deriveTicketCheckInCode } from '../utils/ticketCheckInCode';
import { CheckInService } from './checkInService';

vi.mock('../../notifications', () => ({
  createNotificationUseCase: vi.fn().mockResolvedValue(true),
}));

vi.mock('../../events', () => ({
  getEventListingByIdUseCase: vi.fn().mockResolvedValue({ id: 'evt_1', ownerId: 'partner_1' }),
  getEventOccurrenceByIdUseCase: vi.fn().mockResolvedValue({
    id: 'occ_1',
    eventListingId: 'evt_1',
    // 20:00 e 02:00 em Fortaleza.
    startsAt: '2026-12-20T23:00:00.000Z',
    endsAt: '2026-12-21T05:00:00.000Z',
  }),
  createEventAuditLogUseCase: vi.fn().mockResolvedValue(undefined),
}));

const PARTNER = { uid: 'partner_1', admin: false };

function ticket(id: string, overrides: Partial<Ticket> = {}): Ticket {
  return {
    id,
    occurrenceId: 'occ_1',
    ownerUserId: 'buyer_1',
    status: 'issued',
    qrVersion: 1,
    ...overrides,
  } as Ticket;
}

function setup(nowIso: string) {
  const failures: Array<{ occurrenceId: string; actorUid: string; at: string }> = [];
  const tickets = [
    ticket('tkt_1'),
    ticket('tkt_2', { qrVersion: 2 }),
    ticket('tkt_3', { status: 'refunded' }),
  ];
  const port = {
    getTicketById: vi.fn(async (id: string) => tickets.find((item) => item.id === id) ?? null),
    listTicketsByOccurrenceId: vi.fn(async () => tickets),
    countCheckInCodeFailures: vi.fn(
      async (_occ: string, since: string, actor?: string) =>
        failures.filter((f) => f.at >= since && (!actor || f.actorUid === actor)).length
    ),
    addCheckInCodeFailure: vi.fn(async (occurrenceId: string, actorUid: string, at: string) => {
      failures.push({ occurrenceId, actorUid, at });
    }),
    swapTicketQr: vi.fn(async (id: string) => {
      const found = tickets.find((item) => item.id === id);
      if (found) found.qrVersion += 1;
      return found;
    }),
    checkInTicketAtomic: vi.fn(async (params: { ticketId: string }) => ({
      ticket: tickets.find((item) => item.id === params.ticketId),
      checkIn: { id: 'ci_1', ticketId: params.ticketId },
    })),
  } as unknown as TicketingPort;
  const nowMs = new Date(nowIso).getTime();
  const qr = new Ed25519TicketQrTokenAdapter(() => nowMs);
  return { port, failures, service: new CheckInService(port, qr, () => nowMs) };
}

describe('check-in do ingresso: QR Ed25519 e código INGR (D20, B36)', () => {
  beforeEach(() => {
    const { privateKey } = crypto.generateKeyPairSync('ed25519');
    process.env.TICKET_QR_PRIVATE_KEY_PEM = privateKey
      .export({ type: 'pkcs8', format: 'pem' })
      .toString();
    process.env.TICKET_QR_KEY_ID = 'tq1';
    process.env.TICKET_CHECKIN_CODE_SECRET = 'segredo-de-teste-com-mais-de-32-caracteres';
    resetTicketQrKeysForTests();
  });

  afterEach(() => {
    delete process.env.TICKET_QR_PRIVATE_KEY_PEM;
    delete process.env.TICKET_QR_KEY_ID;
    delete process.env.TICKET_CHECKIN_CODE_SECRET;
    resetTicketQrKeysForTests();
  });

  it('o QR do titular passa na portaria; o código só aparece no dia da sessão', async () => {
    const before = setup('2026-12-19T12:00:00.000Z');
    const early = await before.service.generateTicketPresentationQr(
      { uid: 'buyer_1', admin: false },
      'tkt_1'
    );
    expect(early.token.startsWith('UGT1.')).toBe(true);
    expect(early.code).toBeNull();
    expect(early.codeVisibleFrom).toBe('2026-12-20T03:00:00.000Z');

    const day = setup('2026-12-20T20:00:00.000Z');
    const pass = await day.service.generateTicketPresentationQr(
      { uid: 'buyer_1', admin: false },
      'tkt_1'
    );
    expect(pass.code).toBe(deriveTicketCheckInCode('tkt_1', 1));
    await day.service.checkInTicket(PARTNER, { occurrenceId: 'occ_1', qrToken: early.token });
    expect(day.port.checkInTicketAtomic).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: 'tkt_1' })
    );
  });

  it('código digitado acha o ingresso pela versão atual do QR; código da versão antiga não vale', async () => {
    const { service, port } = setup('2026-12-20T22:00:00.000Z');
    await service.checkInTicket(PARTNER, {
      occurrenceId: 'occ_1',
      code: `INGR:${deriveTicketCheckInCode('tkt_2', 2)}`,
    });
    expect(port.checkInTicketAtomic).toHaveBeenCalledWith(
      expect.objectContaining({ ticketId: 'tkt_2' })
    );
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_2', 1),
      })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_3', 1),
      })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
  });

  it('código fora da janela da sessão é recusado sem contar erro', async () => {
    const { service, failures } = setup('2026-12-20T15:00:00.000Z');
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_1', 1),
      })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    expect(failures).toHaveLength(0);
  });

  it('5 erros da mesma pessoa da equipe em 15 min travam o código, não o QR', async () => {
    const { service, failures } = setup('2026-12-20T22:00:00.000Z');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        service.checkInTicket(PARTNER, { occurrenceId: 'occ_1', code: 'AAAAAAAA' })
      ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
    }
    expect(failures).toHaveLength(5);
    await expect(
      service.checkInTicket(PARTNER, {
        occurrenceId: 'occ_1',
        code: deriveTicketCheckInCode('tkt_1', 1),
      })
    ).rejects.toMatchObject({ code: 'TOO_MANY_REQUESTS' });
  });

  it('outro parceiro não faz check-in por código (IDOR)', async () => {
    const { service } = setup('2026-12-20T22:00:00.000Z');
    await expect(
      service.checkInTicket(
        { uid: 'partner_2', admin: false },
        { occurrenceId: 'occ_1', code: deriveTicketCheckInCode('tkt_1', 1) }
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('"Problema com o QR Code?": troca a versão, o código antigo para de valer e o titular é avisado', async () => {
    const { service, port } = setup('2026-12-20T22:00:00.000Z');
    const oldCode = deriveTicketCheckInCode('tkt_1', 1);
    const pass = await service.swapPresentationQr({ uid: 'buyer_1', admin: false }, 'tkt_1');
    expect(port.swapTicketQr).toHaveBeenCalledWith('tkt_1', 'buyer_1', expect.any(String));
    expect(pass.code).toBe(deriveTicketCheckInCode('tkt_1', 2));
    await expect(
      service.checkInTicket(PARTNER, { occurrenceId: 'occ_1', code: oldCode })
    ).rejects.toMatchObject({ code: 'UNPROCESSABLE_ENTITY' });
  });
});
