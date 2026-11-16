import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import type { BookableOffer, Booking, BookingStatus } from '../types/bookingTypes';
import { OfferService } from './offerService';

const NOW = new Date('2026-11-16T12:00:00.000Z');

function offer(id: string, overrides: Partial<BookableOffer> = {}): BookableOffer {
  return {
    id,
    guideItemId: 'item-1',
    ownerId: 'partner-1',
    partnerId: 'partner-1',
    kind: 'tour',
    title: { 'pt-BR': `Oferta ${id}` },
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

function booking(id: string, offerId: string, status: BookingStatus): Booking {
  return {
    id,
    offerId,
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: `buyer-${id}`,
    sellerPartnerId: 'partner-1',
    kind: 'tour',
    status,
    lines: [],
    participantsCount: 2,
    subtotalMinor: 1000,
    platformFeeMinor: 150,
    totalMinor: 1000,
    expiresAt: null,
    offerSnapshot: {
      title: 'x',
      startsAt: '2026-11-20T12:00:00.000Z',
      durationMinutes: 120,
      cancellationPolicy: 'moderate',
    },
    locale: 'pt-BR',
    idempotencyKey: id,
    createdAt: '',
    updatedAt: '',
  };
}

function setup() {
  const port = new InMemoryBookingsAdapter();
  const items: BookableItemLookupPort = { getItem: async () => null };
  port.offers.set('passeio', offer('passeio'));
  port.offers.set('rascunho', offer('rascunho', { status: 'draft' }));
  port.offers.set('de-outro-item', offer('de-outro-item', { guideItemId: 'item-2' }));
  port.publicOffers.set('passeio', { id: 'passeio' } as never);
  port.publicOffers.set('de-outro-item', { id: 'de-outro-item' } as never);
  return { port, service: new OfferService(port, items, () => NOW) };
}

describe('OfferService: exclusão do anúncio (D34, F2)', () => {
  it('reserva aguardando pagamento ou confirmada prende o anúncio', async () => {
    for (const status of ['pending_payment', 'confirmed'] as const) {
      const { port, service } = setup();
      port.bookings.set('b1', booking('b1', 'rascunho', status));
      expect(await service.hasActiveBookingsForGuideItem('item-1')).toBe(true);
    }
  });

  it('reservas concluídas, canceladas ou de outro anúncio não prendem', async () => {
    const { port, service } = setup();
    port.bookings.set('b1', booking('b1', 'passeio', 'completed'));
    port.bookings.set('b2', booking('b2', 'passeio', 'canceled'));
    port.bookings.set('b3', booking('b3', 'de-outro-item', 'confirmed'));
    expect(await service.hasActiveBookingsForGuideItem('item-1')).toBe(false);
  });

  it('as ofertas do anúncio excluído saem do app; as de outro anúncio ficam', async () => {
    const { port, service } = setup();
    port.bookings.set('b1', booking('b1', 'passeio', 'completed'));
    await service.archiveOffersOfGuideItem('item-1');

    expect(port.offers.get('passeio')?.status).toBe('archived');
    expect(port.offers.get('rascunho')?.status).toBe('archived');
    expect(port.publicOffers.has('passeio')).toBe(false);
    expect(port.offers.get('de-outro-item')?.status).toBe('published');
    expect(port.publicOffers.has('de-outro-item')).toBe(true);
    // A reserva antiga continua guardada (retenção legal).
    expect(port.bookings.has('b1')).toBe(true);
  });

  it('conta encerrada: reserva ativa em qualquer oferta do dono prende; arquivar tira todas do app', async () => {
    const { port, service } = setup();
    port.offers.set('de-outro-dono', offer('de-outro-dono', { ownerId: 'partner-2' }));
    port.publicOffers.set('de-outro-dono', { id: 'de-outro-dono' } as never);
    port.bookings.set('b1', booking('b1', 'de-outro-item', 'confirmed'));
    expect(await service.hasActiveBookingsForOwner('partner-1')).toBe(true);
    expect(await service.hasActiveBookingsForOwner('partner-2')).toBe(false);

    await service.archiveOffersByOwner('partner-1');
    for (const id of ['passeio', 'rascunho', 'de-outro-item']) {
      expect(port.offers.get(id)?.status).toBe('archived');
      expect(port.publicOffers.has(id)).toBe(false);
    }
    expect(port.offers.get('de-outro-dono')?.status).toBe('published');
    expect(port.publicOffers.has('de-outro-dono')).toBe(true);
  });
});
