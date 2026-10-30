import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableOffer, Booking } from '../types/bookingTypes';
import { BookingServiceProofService } from './bookingServiceProofService';

const STARTS_AT = '2026-11-10T11:00:00.000Z';
const PARTNER = { uid: 'partner-1', admin: false };
const BUYER = { uid: 'buyer-1', admin: false };

function offer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-1',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'tour',
    title: { 'pt-BR': 'Buggy' },
    status: 'published',
    pricing: { currency: 'BRL', priceOptions: [] },
    durationMinutes: 120,
    cancellationPolicy: 'moderate',
    maxParticipantsPerBooking: 6,
    requiresParticipantNames: false,
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'tour',
    status: 'confirmed',
    lines: [],
    participantsCount: 4,
    subtotalMinor: 40000,
    platformFeeMinor: 6000,
    totalMinor: 40000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Buggy',
      startsAt: STARTS_AT,
      durationMinutes: 120,
      cancellationPolicy: 'moderate',
    },
    locale: 'pt-BR',
    idempotencyKey: 'key-1',
    createdAt: '2026-11-01T12:00:00.000Z',
    updatedAt: '2026-11-01T12:00:00.000Z',
    ...overrides,
  };
}

function setup(now = '2026-11-10T11:05:00.000Z', bookingOverrides: Partial<Booking> = {}) {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', offer());
  port.offers.set('offer-2', offer({ id: 'offer-2', ownerId: 'partner-2' }));
  port.bookings.set('booking-1', booking(bookingOverrides));
  let current = new Date(now);
  const service = new BookingServiceProofService(port, () => current);
  return {
    port,
    service,
    setNow: (iso: string) => {
      current = new Date(iso);
    },
  };
}

describe('BookingServiceProofService (D20)', () => {
  it('"Cheguei" grava hora e localização; tocar de novo mantém a primeira hora', async () => {
    const { service, setNow } = setup();
    const first = await service.recordArrival(PARTNER, 'offer-1', 'booking-1', {
      lat: -2.79,
      lng: -40.51,
    });
    expect(first.arrival).toEqual({
      at: '2026-11-10T11:05:00.000Z',
      byUid: 'partner-1',
      location: { lat: -2.79, lng: -40.51 },
    });
    setNow('2026-11-10T11:20:00.000Z');
    const again = await service.recordArrival(PARTNER, 'offer-1', 'booking-1');
    expect(again.arrival?.at).toBe('2026-11-10T11:05:00.000Z');
  });

  it('outro parceiro ou a oferta errada não registram nada (IDOR)', async () => {
    const { service } = setup();
    await expect(
      service.recordArrival({ uid: 'partner-2', admin: false }, 'offer-1', 'booking-1')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.recordArrival(PARTNER, 'offer-2', 'booking-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('"Cheguei" fora da janela do serviço é recusado', async () => {
    const { service } = setup('2026-11-10T08:00:00.000Z');
    await expect(service.recordArrival(PARTNER, 'offer-1', 'booking-1')).rejects.toMatchObject({
      code: 'CHECK_IN_WINDOW_CLOSED',
    });
  });

  it('"Cliente sem código" grava o check-in por conta do prestador e pergunta ao comprador', async () => {
    const { service } = setup();
    const updated = await service.checkInWithoutCode(PARTNER, {
      offerId: 'offer-1',
      bookingId: 'booking-1',
      reason: 'no_phone',
    });
    // Sem código, o registro vale para todas as unidades da reserva.
    expect(updated.checkIns).toHaveLength(4);
    expect(updated.checkIns?.[3]).toMatchObject({
      unit: 3,
      method: 'no_code',
      noCodeReason: 'no_phone',
    });
    expect(updated.serviceConfirmation).toMatchObject({
      reason: 'no_code',
      answerBy: '2026-11-13T11:05:00.000Z',
    });
    expect(updated.deadline).toEqual({
      kind: 'service_confirmation',
      at: '2026-11-13T11:05:00.000Z',
    });
  });

  it('"O prestador não veio" só 30 min depois do horário e sem check-in', async () => {
    const early = setup('2026-11-10T11:29:00.000Z');
    await expect(
      early.service.getBookingForAbsenceReport(BUYER, 'booking-1')
    ).rejects.toMatchObject({ code: 'ABSENCE_REPORT_NOT_ALLOWED' });
    const checkedIn = setup('2026-11-10T11:31:00.000Z', {
      checkIns: [{ unit: 0, at: STARTS_AT, byUid: 'partner-1', method: 'code' }],
    });
    await expect(
      checkedIn.service.getBookingForAbsenceReport(BUYER, 'booking-1')
    ).rejects.toMatchObject({ code: 'ABSENCE_REPORT_NOT_ALLOWED' });
    const ok = setup('2026-11-10T11:31:00.000Z');
    await expect(ok.service.getBookingForAbsenceReport(BUYER, 'booking-1')).resolves.toMatchObject({
      id: 'booking-1',
    });
    await expect(ok.service.getBookingForAbsenceReport(PARTNER, 'booking-1')).rejects.toMatchObject(
      { code: 'NOT_FOUND' }
    );
  });

  it('relato grava prazo de 2 h; resposta tira o prazo e não aceita responder de novo', async () => {
    const { service } = setup('2026-11-10T11:31:00.000Z');
    const reported = await service.recordProviderAbsence(
      BUYER,
      'booking-1',
      'claim_booking_booking-1'
    );
    expect(reported.providerAbsence).toMatchObject({ respondBy: '2026-11-10T13:31:00.000Z' });
    expect(reported.deadline).toEqual({
      kind: 'provider_absence_response',
      at: '2026-11-10T13:31:00.000Z',
    });
    await service.getOpenProviderAbsence(PARTNER, 'offer-1', 'booking-1');
    const resolved = await service.resolveProviderAbsence(
      'booking-1',
      { answer: 'was_there', resolution: 'admin' },
      'partner-1'
    );
    expect(resolved.deadline).toBeUndefined();
    expect(resolved.providerAbsence).toMatchObject({ answer: 'was_there', resolution: 'admin' });
    await expect(
      service.getOpenProviderAbsence(PARTNER, 'offer-1', 'booking-1')
    ).rejects.toMatchObject({ code: 'NOTHING_TO_ANSWER' });
  });

  it('"Cliente sem código" depois do relato de ausência é recusado: o prestador responde ao relato', async () => {
    const { service } = setup('2026-11-10T11:31:00.000Z');
    await service.recordProviderAbsence(BUYER, 'booking-1', 'claim_1');
    await expect(
      service.checkInWithoutCode(PARTNER, {
        offerId: 'offer-1',
        bookingId: 'booking-1',
        reason: 'other',
      })
    ).rejects.toMatchObject({ code: 'INVALID_TRANSITION' });
  });

  it('pergunta ao comprador vence em 72 h e só ele responde', async () => {
    const { service, setNow } = setup('2026-11-10T13:00:00.000Z', {
      status: 'completed',
      serviceConfirmation: {
        askedAt: '2026-11-10T13:00:00.000Z',
        answerBy: '2026-11-13T13:00:00.000Z',
        reason: 'no_record',
      },
      deadline: { kind: 'service_confirmation', at: '2026-11-13T13:00:00.000Z' },
    });
    await expect(service.getPendingConfirmation(PARTNER, 'booking-1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(service.getPendingConfirmation(BUYER, 'booking-1')).resolves.toMatchObject({
      id: 'booking-1',
    });
    expect(await service.listBookingsWithDueDeadline(10)).toHaveLength(0);
    setNow('2026-11-13T13:01:00.000Z');
    await expect(service.getPendingConfirmation(BUYER, 'booking-1')).rejects.toMatchObject({
      code: 'NOTHING_TO_ANSWER',
    });
    expect((await service.listBookingsWithDueDeadline(10)).map((b) => b.id)).toEqual(['booking-1']);
    const resolved = await service.resolveServiceConfirmation(
      'booking-1',
      { resolution: 'refunded', claimId: 'claim_1' },
      'system'
    );
    expect(resolved.deadline).toBeUndefined();
    expect(resolved.serviceConfirmation?.resolution).toBe('refunded');
  });
});
