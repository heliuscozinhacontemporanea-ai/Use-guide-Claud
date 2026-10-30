import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { EntryPassPayload, EntryPassSignerPort } from '../ports/entryPassSignerPort';
import type { BookableOffer, Booking } from '../types/bookingTypes';
import { deriveCheckInCode, ENTRY_CODE_LENGTH } from '../utils/checkInCode';
import { BookingEntryService } from './bookingEntryService';

const OWNER = { uid: 'partner-1', admin: false };
const BUYER = { uid: 'buyer-1', admin: false };
const STARTS_AT = '2026-11-10T12:00:00.000Z';
const ENDS_AT = '2026-11-10T20:00:00.000Z';

/** Assinador de teste: o token é o próprio conteúdo em JSON, com "assinatura" fixa. */
class FakeSigner implements EntryPassSignerPort {
  sign(payload: Omit<EntryPassPayload, 'kid'>): string {
    return `UGE1.${JSON.stringify({ ...payload, kid: 'k1' })}.ok`;
  }
  verify(token: string): EntryPassPayload | null {
    const [, body, signature] = token.split(/\.(?=\{)|\.(?=ok$)/);
    return signature === 'ok' && body ? (JSON.parse(body) as EntryPassPayload) : null;
  }
  publicKeys() {
    return [{ kid: 'k1', publicKeyJwk: { kty: 'OKP', crv: 'Ed25519', x: 'abc' } }];
  }
}

function offer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-1',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'private_entry',
    title: { 'pt-BR': 'Lagoa privada' },
    status: 'published',
    pricing: { currency: 'BRL', priceOptions: [] },
    cancellationPolicy: 'moderate',
    maxParticipantsPerBooking: 6,
    requiresParticipantNames: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function booking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'private_entry',
    status: 'confirmed',
    lines: [],
    participantsCount: 3,
    subtotalMinor: 9000,
    platformFeeMinor: 1350,
    totalMinor: 9000,
    expiresAt: null,
    offerSnapshot: { title: 'Lagoa privada', startsAt: STARTS_AT, cancellationPolicy: 'moderate' },
    locale: 'pt-BR',
    idempotencyKey: `key-${id}`,
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '',
    ...overrides,
  };
}

function setup(now = '2026-11-10T14:00:00.000Z') {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', offer());
  port.offers.set('offer-2', offer({ id: 'offer-2', kind: 'tour' }));
  port.slots.set('slot-1', {
    id: 'slot-1',
    offerId: 'offer-1',
    startsAt: STARTS_AT,
    endsAt: ENDS_AT,
    capacityTotal: 50,
    capacityReserved: 0,
    capacitySold: 5,
    status: 'open',
    createdAt: '',
    updatedAt: '',
  });
  port.bookings.set('bk_1', booking('bk_1'));
  port.bookings.set('bk_2', booking('bk_2', { buyerId: 'buyer-2', participantsCount: 1 }));
  let current = new Date(now);
  const service = new BookingEntryService(port, new FakeSigner(), () => current);
  return { port, service, setNow: (iso: string) => (current = new Date(iso)) };
}

const entry = (extra: Record<string, unknown>) => ({
  offerId: 'offer-1',
  slotId: 'slot-1',
  participantsPresent: 2,
  ...extra,
});

describe('BookingEntryService (D20)', () => {
  beforeEach(() => {
    process.env.BOOKING_CHECKIN_CODE_SECRET = 's'.repeat(32);
  });
  afterEach(() => {
    delete process.env.BOOKING_CHECKIN_CODE_SECRET;
  });

  it('o comprador vê QR e código de 8 caracteres só no dia, até o fechamento', async () => {
    const early = setup('2026-11-10T02:59:00.000Z');
    expect(await early.service.getEntryPass(BUYER, 'bk_1')).toMatchObject({
      qrToken: null,
      code: null,
      visibleFrom: '2026-11-10T03:00:00.000Z',
      validUntil: ENDS_AT,
    });
    const { service } = setup();
    const pass = await service.getEntryPass(BUYER, 'bk_1');
    expect(pass.code).toBe(deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH));
    expect(pass.code).toHaveLength(8);
    expect(pass.qrToken).toContain('"bid":"bk_1"');
    await expect(service.getEntryPass(OWNER, 'bk_1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('o código da entrada não repete os 6 caracteres do passeio', () => {
    expect(deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH).slice(0, 6)).not.toBe(
      deriveCheckInCode('bk_1')
    );
  });

  it('portaria lê o QR, grava a entrada e não deixa entrar de novo', async () => {
    const { service, port } = setup();
    const pass = await service.getEntryPass(BUYER, 'bk_1');
    const updated = await service.checkIn(OWNER, entry({ qrToken: pass.qrToken }));
    expect(updated.checkIn).toMatchObject({ method: 'qr', participantsPresent: 2 });
    const again = await service.checkIn(
      OWNER,
      entry({ qrToken: pass.qrToken, participantsPresent: 1 })
    );
    expect(again.checkIn?.participantsPresent).toBe(2);
    expect(port.audit.filter((a) => a.reason === 'checked_in')).toHaveLength(1);
  });

  it('código de 8 caracteres com prefixo da tela também vale', async () => {
    const { service } = setup();
    const code = deriveCheckInCode('bk_2', ENTRY_CODE_LENGTH);
    const updated = await service.checkIn(
      OWNER,
      entry({ code: `entr:${code}`, participantsPresent: 1 })
    );
    expect(updated).toMatchObject({ id: 'bk_2', checkIn: { method: 'code' } });
  });

  it('QR de outro horário ou adulterado é recusado', async () => {
    const { service } = setup();
    const forged = `UGE1.${JSON.stringify({ v: 1, kid: 'k1', bid: 'bk_1', sid: 'slot-9', oid: 'offer-1', n: 3, exp: 1 })}.ok`;
    await expect(service.checkIn(OWNER, entry({ qrToken: forged }))).rejects.toMatchObject({
      code: 'INVALID_ENTRY_PASS',
    });
    await expect(service.checkIn(OWNER, entry({ qrToken: 'UGE1.{}.bad' }))).rejects.toMatchObject({
      code: 'INVALID_ENTRY_PASS',
    });
  });

  it('5 códigos errados da mesma pessoa travam por 15 min', async () => {
    const { service, port } = setup();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.checkIn(OWNER, entry({ code: 'ZZZZZZZZ' }))).rejects.toMatchObject({
        code: 'INVALID_CHECK_IN_CODE',
      });
    }
    await expect(
      service.checkIn(OWNER, entry({ code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH) }))
    ).rejects.toMatchObject({ code: 'CHECK_IN_LOCKED' });
    expect(port.checkInFailures.every((f) => f.actorUid === 'partner-1')).toBe(true);
  });

  it('50 erros no horário travam todo mundo, mesmo quem não errou', async () => {
    const { service, port } = setup();
    for (let i = 0; i < 50; i += 1) {
      port.checkInFailures.push({
        slotId: 'slot-1',
        actorUid: `staff-${i}`,
        at: '2026-11-10T13:59:00.000Z',
      });
    }
    await expect(
      service.checkIn(OWNER, entry({ code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH) }))
    ).rejects.toMatchObject({ code: 'CHECK_IN_LOCKED' });
  });

  it('depois do fechamento a entrada não vale; outro parceiro ou oferta que não é entrada recebem 404/422', async () => {
    const late = setup('2026-11-10T20:01:00.000Z');
    await expect(
      late.service.checkIn(OWNER, entry({ code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH) }))
    ).rejects.toMatchObject({ code: 'CHECK_IN_WINDOW_CLOSED' });
    const { service } = setup();
    await expect(
      service.checkIn({ uid: 'partner-2', admin: false }, entry({ code: 'X' }))
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.getVerificationKeys(OWNER, 'offer-2')).rejects.toMatchObject({
      code: 'CHECK_IN_NOT_APPLICABLE',
    });
    expect(await service.getVerificationKeys(OWNER, 'offer-1')).toHaveLength(1);
  });

  it('entrada validada sem internet vale pela hora do aparelho, se foi antes do fechamento', async () => {
    const { service } = setup('2026-11-10T21:00:00.000Z');
    const updated = await service.checkIn(
      OWNER,
      entry({
        code: deriveCheckInCode('bk_1', ENTRY_CODE_LENGTH),
        capturedAt: '2026-11-10T19:30:00.000Z',
      })
    );
    expect(updated.checkIn).toMatchObject({
      at: '2026-11-10T19:30:00.000Z',
      syncedAt: '2026-11-10T21:00:00.000Z',
    });
  });
});
