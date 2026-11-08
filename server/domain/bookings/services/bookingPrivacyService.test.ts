import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { Booking } from '../types/bookingTypes';
import { BookingPrivacyService } from './bookingPrivacyService';

function booking(id: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    offerId: 'offer-1',
    slotId: 'slot-1',
    guideItemId: 'item-1',
    buyerId: 'buyer-1',
    sellerPartnerId: 'partner-1',
    kind: 'tour',
    status: 'completed',
    lines: [],
    participantsCount: 2,
    subtotalMinor: 20000,
    platformFeeMinor: 3000,
    totalMinor: 20000,
    expiresAt: null,
    offerSnapshot: {
      title: 'Buggy',
      startsAt: '2026-11-10T11:00:00.000Z',
      cancellationPolicy: 'moderate',
    },
    locale: 'pt-BR',
    idempotencyKey: `key-${id}`,
    createdAt: `2026-11-01T12:00:0${id.slice(-1)}.000Z`,
    updatedAt: '',
    ...overrides,
  };
}

describe('BookingPrivacyService (§7.5, D20)', () => {
  it('apaga o endereço de busca 7 dias depois do serviço e mantém a reserva', async () => {
    const port = new InMemoryBookingsAdapter();
    port.bookings.set(
      'bk_1',
      booking('bk_1', {
        pickupAddress: 'Pousada Vila Jeri',
        pickupAddressEraseAt: '2026-11-17T13:00:00.000Z',
      })
    );
    port.bookings.set(
      'bk_2',
      booking('bk_2', { pickupAddress: 'Hotel', pickupAddressEraseAt: '2026-11-20T13:00:00.000Z' })
    );
    const service = new BookingPrivacyService(port, () => new Date('2026-11-18T00:00:00.000Z'));
    expect(await service.eraseExpiredPickupAddresses()).toBe(1);
    const erased = port.bookings.get('bk_1');
    expect(erased?.pickupAddress).toBeUndefined();
    expect(erased?.pickupAddressEraseAt).toBeUndefined();
    expect(erased?.totalMinor).toBe(20000);
    expect(port.bookings.get('bk_2')?.pickupAddress).toBe('Hotel');
  });

  it('exclusão de conta tira endereço e nomes de todas as reservas do comprador', async () => {
    const port = new InMemoryBookingsAdapter();
    for (const id of ['bk_1', 'bk_2', 'bk_3']) {
      port.bookings.set(id, booking(id, { pickupAddress: 'Pousada' }));
      port.participants.set(id, [{ name: 'Ana Souza', isLeadContact: true }]);
    }
    port.bookings.set('bk_x', booking('bk_x', { buyerId: 'outra', pickupAddress: 'Casa' }));
    const service = new BookingPrivacyService(port);
    expect(await service.anonymizeBuyer('buyer-1')).toBe(3);
    for (const id of ['bk_1', 'bk_2', 'bk_3']) {
      expect(port.bookings.get(id)?.pickupAddress).toBeUndefined();
      expect(port.participants.get(id)).toBeUndefined();
    }
    expect(port.bookings.get('bk_x')?.pickupAddress).toBe('Casa');
  });
});
