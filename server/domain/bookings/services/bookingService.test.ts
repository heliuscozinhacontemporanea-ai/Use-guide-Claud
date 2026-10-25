import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableOffer } from '../types/bookingTypes';
import { BookingService, type CreatePendingBookingInput } from './bookingService';

const BUYER = { uid: 'buyer-1', admin: false };
const FEES = {
  bookingsBps: 1000,
  ticketsBps: 1000,
  ticketsAbsorbedBps: 1250,
  ticketServiceFeeMinor: 300,
};

const STARTS_AT = '2026-11-10T11:00:00.000Z';

function buildOffer(overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id: 'offer-1',
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'tour',
    title: { 'pt-BR': 'Passeio' },
    status: 'published',
    pricing: {
      currency: 'BRL',
      priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 10000 }],
    },
    durationMinutes: 120,
    cancellationPolicy: 'moderate',
    maxParticipantsPerBooking: 6,
    requiresParticipantNames: false,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...overrides,
  };
}

function setup(options: { now?: string; capacity?: number; offer?: Partial<BookableOffer> } = {}) {
  const port = new InMemoryBookingsAdapter();
  port.offers.set('offer-1', buildOffer(options.offer));
  for (const id of ['slot-1', 'slot-other']) {
    port.slots.set(id, {
      id,
      offerId: id === 'slot-1' ? 'offer-1' : 'offer-2',
      startsAt: STARTS_AT,
      capacityTotal: options.capacity ?? 4,
      capacityReserved: 0,
      capacitySold: 0,
      status: 'open',
      createdAt: '',
      updatedAt: '',
    });
  }
  let now = new Date(options.now ?? '2026-11-01T12:00:00.000Z');
  const service = new BookingService(port, () => now);
  const setNow = (iso: string) => {
    now = new Date(iso);
  };
  return { port, service, setNow };
}

const INPUT: CreatePendingBookingInput = {
  offerId: 'offer-1',
  slotId: 'slot-1',
  lines: [{ priceOptionId: 'adult', quantity: 2 }],
  participants: [],
  idempotencyKey: 'key-12345',
  locale: 'pt-BR',
};

describe('BookingService', () => {
  it('cria reserva pendente com preço do backend, vagas reservadas e prazo de 15 min', async () => {
    const { service, port } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    expect(booking).toMatchObject({
      status: 'pending_payment',
      totalMinor: 20000,
      platformFeeMinor: 2000,
      sellerPartnerId: 'partner-1',
      expiresAt: '2026-11-01T12:15:00.000Z',
    });
    expect(port.slots.get('slot-1')?.capacityReserved).toBe(2);
  });

  it('mesma chave de idempotência devolve a mesma reserva sem reservar de novo', async () => {
    const { service, port } = setup();
    const first = await service.createPendingBooking(BUYER, INPUT, FEES);
    const second = await service.createPendingBooking(BUYER, INPUT, FEES);
    expect(second.id).toBe(first.id);
    expect(port.slots.get('slot-1')?.capacityReserved).toBe(2);
  });

  it('horário de outra oferta → VALIDATION_ERROR; vagas insuficientes → 409', async () => {
    const { service } = setup({ capacity: 1 });
    await expect(
      service.createPendingBooking(BUYER, { ...INPUT, slotId: 'slot-other' }, FEES)
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(service.createPendingBooking(BUYER, INPUT, FEES)).rejects.toMatchObject({
      code: 'INSUFFICIENT_CAPACITY',
      statusCode: 409,
    });
  });

  it('exige um nome por participante quando a oferta pede', async () => {
    const { service } = setup({ offer: { requiresParticipantNames: true } });
    await expect(
      service.createPendingBooking(BUYER, { ...INPUT, participants: [{ name: 'Ana' }] }, FEES)
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const booking = await service.createPendingBooking(
      BUYER,
      { ...INPUT, participants: [{ name: 'Ana' }, { name: 'Bia' }] },
      FEES
    );
    expect(booking.status).toBe('pending_payment');
  });

  it('terceiro não vê a reserva (404); comprador e parceiro vendedor veem', async () => {
    const { service } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    await expect(
      service.getBookingForActor({ uid: 'intruso', admin: false }, booking.id)
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.getBookingForActor(BUYER, booking.id)).resolves.toBeTruthy();
    await expect(
      service.getBookingForActor({ uid: 'partner-1', admin: false }, booking.id)
    ).resolves.toBeTruthy();
  });

  it('confirmação move vagas de reservadas para vendidas e é idempotente', async () => {
    const { service, port } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    await service.confirmBookingPayment(booking.id, 'pi_1');
    expect(port.slots.get('slot-1')).toMatchObject({ capacityReserved: 0, capacitySold: 2 });
    expect(port.bookings.get(booking.id)?.status).toBe('confirmed');
  });

  it('expiração devolve as vagas; pagamento tardio sem vaga é recusado', async () => {
    const { service, port, setNow } = setup({ capacity: 2 });
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    setNow('2026-11-01T12:16:00.000Z');
    await expect(service.expireOverdueBookings()).resolves.toBe(1);
    expect(port.slots.get('slot-1')?.capacityReserved).toBe(0);
    const other = await service.createPendingBooking({ uid: 'buyer-2', admin: false }, INPUT, FEES);
    await service.confirmBookingPayment(other.id, 'pi_2');
    await expect(service.confirmBookingPayment(booking.id, 'pi_1')).rejects.toMatchObject({
      code: 'LATE_PAYMENT_REJECTED',
    });
  });

  it('arrependimento (7 dias da compra, 48 h antes): 100%, repetível, devolve a vaga', async () => {
    const { service, port } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    const first = await service.requestCancellationByBuyer(BUYER, booking.id, 'mudança de planos');
    expect(first).toMatchObject({ refundPercent: 100, refundAmountMinor: 20000 });
    expect(port.slots.get('slot-1')?.capacitySold).toBe(0);
    const again = await service.requestCancellationByBuyer(BUYER, booking.id, '');
    expect(again.refundAmountMinor).toBe(20000);
  });

  it('fora do arrependimento vale a política (moderada: 50% até 24 h); outra pessoa não cancela', async () => {
    const { service, setNow } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    await expect(
      service.requestCancellationByBuyer({ uid: 'intruso', admin: false }, booking.id, '')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    setNow('2026-11-09T00:00:00.000Z');
    await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).resolves.toMatchObject({
      refundPercent: 50,
      refundAmountMinor: 10000,
    });
  });

  it('reserva pendente não pode ser cancelada pelo comprador', async () => {
    const { service } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    await expect(service.requestCancellationByBuyer(BUYER, booking.id, '')).rejects.toMatchObject({
      code: 'CANCELLATION_NOT_ALLOWED',
    });
  });

  it('não comparecimento só pelo parceiro e só depois do início; conclusão após a duração', async () => {
    const { service, port, setNow } = setup();
    const booking = await service.createPendingBooking(BUYER, INPUT, FEES);
    await service.confirmBookingPayment(booking.id, 'pi_1');
    const partner = { uid: 'partner-1', admin: false };
    await expect(service.markBookingNoShow(partner, booking.id)).rejects.toMatchObject({
      code: 'INVALID_TRANSITION',
    });
    setNow('2026-11-10T12:00:00.000Z');
    await expect(service.completeFinishedBookings()).resolves.toBe(0);
    setNow('2026-11-10T13:00:00.000Z');
    await expect(service.completeFinishedBookings()).resolves.toBe(1);
    expect(port.bookings.get(booking.id)?.status).toBe('completed');
  });
});
