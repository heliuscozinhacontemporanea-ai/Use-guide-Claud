import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { AvailabilitySlot, BookableOffer, Booking } from '../types/bookingTypes';
import { OwnerAgendaService } from './ownerAgendaService';

const T = '2026-11-08T12:00:00.000Z';

function offer(id: string, ownerId: string): BookableOffer {
  return {
    id,
    guideItemId: `item-${id}`,
    ownerId,
    partnerId: ownerId,
    kind: 'tour',
    title: { 'pt-BR': `Oferta ${id}` },
    status: 'published',
    pricing: { currency: 'BRL', priceOptions: [] },
    cancellationPolicy: 'flexible' as never,
    maxParticipantsPerBooking: 8,
    requiresParticipantNames: false,
    createdAt: T,
    updatedAt: T,
  };
}

function slot(
  id: string,
  offerId: string,
  status: AvailabilitySlot['status'] = 'open'
): AvailabilitySlot {
  return {
    id,
    offerId,
    startsAt: T,
    capacityTotal: 8,
    capacityReserved: 0,
    capacitySold: 6,
    status,
    createdAt: T,
    updatedAt: T,
  };
}

function booking(id: string, slotId: string, overrides: Partial<Booking> = {}): Booking {
  return {
    id,
    offerId: 'o1',
    slotId,
    guideItemId: 'item-o1',
    buyerId: 'buyer',
    sellerPartnerId: 'owner',
    kind: 'tour',
    status: 'confirmed',
    lines: [],
    participantsCount: 2,
    subtotalMinor: 0,
    platformFeeMinor: 0,
    totalMinor: 0,
    expiresAt: null,
    offerSnapshot: { title: 'Oferta', startsAt: T, cancellationPolicy: 'flexible' as never },
    locale: 'pt-BR',
    idempotencyKey: id,
    createdAt: T,
    updatedAt: T,
    ...overrides,
  };
}

describe('OwnerAgendaService', () => {
  it('resume os horários do dono e as ausências relatadas sem resposta', async () => {
    const port = new InMemoryBookingsAdapter();
    await port.createOffer(offer('o1', 'owner'));
    await port.createOffer(offer('o2', 'outro'));
    await port.createSlots([slot('s1', 'o1'), slot('s2', 'o1', 'canceled'), slot('s3', 'o2')]);
    const at = (iso: string) => ({ unit: 0, at: iso, byUid: 'owner', method: 'code' as const });
    port.bookings.set(
      'b1',
      booking('b1', 's1', {
        checkIns: [at(T)],
        arrival: { at: '2026-11-08T11:52:00.000Z', byUid: 'owner' },
      })
    );
    port.bookings.set(
      'b2',
      booking('b2', 's1', {
        providerAbsence: {
          reportedAt: T,
          respondBy: '2026-11-08T14:30:00.000Z',
          claimId: 'c1',
        },
      })
    );
    port.bookings.set('b3', booking('b3', 's1', { status: 'canceled' }));

    const agenda = await new OwnerAgendaService(port).listOwnerAgenda(
      { uid: 'owner', admin: false },
      '2026-11-08T03:00:00.000Z',
      '2026-11-09T03:00:00.000Z'
    );

    expect(agenda.slots).toHaveLength(1);
    expect(agenda.slots[0]).toMatchObject({
      slotId: 's1',
      bookingsCount: 2,
      unitsCount: 4,
      checkedInUnits: 1,
      arrivedAt: '2026-11-08T11:52:00.000Z',
    });
    expect(agenda.openAbsences.map((absence) => absence.bookingId)).toEqual(['b2']);
  });
});
