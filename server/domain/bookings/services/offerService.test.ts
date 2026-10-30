import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { BookableItem, BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import { type OfferInput, OfferService } from './offerService';

const NOW = new Date('2026-11-01T12:00:00.000Z');
const OWNER = { uid: 'partner-1', admin: false };

const INPUT: OfferInput = {
  title: { 'pt-BR': 'Passeio Lagoa do Paraíso' },
  pricing: {
    currency: 'BRL',
    priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15000 }],
  },
  durationMinutes: 240,
  cancellationPolicy: 'flexible',
  maxParticipantsPerBooking: 8,
  requiresParticipantNames: false,
};

function setup(item: Partial<BookableItem> | null = {}) {
  const port = new InMemoryBookingsAdapter();
  const items: BookableItemLookupPort = {
    getItem: async () =>
      item === null
        ? null
        : {
            id: 'item-1',
            ownerId: 'partner-1',
            partnerId: 'partner-1',
            category: 'tour',
            name: 'Buggy do Zé',
            ...item,
          },
  };
  let counter = 0;
  const service = new OfferService(
    port,
    items,
    () => NOW,
    () => {
      counter += 1;
      return `id${counter}`;
    }
  );
  return { port, service };
}

describe('OfferService', () => {
  it('cria oferta em rascunho com dono e parceiro vindos do item', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    expect(offer).toMatchObject({
      id: 'offer_id1',
      status: 'draft',
      ownerId: 'partner-1',
      partnerId: 'partner-1',
      // O cliente reconhece quem presta pelo nome do estabelecimento (D20).
      businessName: 'Buggy do Zé',
    });
  });

  it('venda por grupo exige o tamanho do grupo e não vale para entrada de atração (D20)', async () => {
    const { service } = setup();
    await expect(
      service.createOffer(OWNER, {
        ...INPUT,
        guideItemId: 'item-1',
        kind: 'tour',
        sellingUnit: 'group',
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    await expect(
      service.createOffer(OWNER, {
        ...INPUT,
        guideItemId: 'item-1',
        kind: 'tour',
        sellingUnit: 'group',
        groupMaxPeople: 4,
      })
    ).resolves.toMatchObject({ sellingUnit: 'group', groupMaxPeople: 4 });
    const attraction = setup({ category: 'attraction' });
    await expect(
      attraction.service.createOffer(OWNER, {
        ...INPUT,
        guideItemId: 'item-1',
        kind: 'private_entry',
        sellingUnit: 'group',
        groupMaxPeople: 4,
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('item de outro dono → FORBIDDEN', async () => {
    const { service } = setup({ ownerId: 'outro' });
    await expect(
      service.createOffer(OWNER, { ...INPUT, guideItemId: 'item-1', kind: 'tour' })
    ).rejects.toMatchObject({ code: 'FORBIDDEN', statusCode: 403 });
  });

  it('rental e transfer ainda não estão disponíveis', async () => {
    const { service } = setup();
    await expect(
      service.createOffer(OWNER, { ...INPUT, guideItemId: 'item-1', kind: 'rental' })
    ).rejects.toMatchObject({ code: 'KIND_NOT_AVAILABLE', statusCode: 422 });
  });

  it('tipo incompatível com a categoria do item e preço não inteiro são recusados', async () => {
    const { service } = setup({ category: 'restaurant' });
    await expect(
      service.createOffer(OWNER, { ...INPUT, guideItemId: 'item-1', kind: 'tour' })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const ok = setup();
    await expect(
      ok.service.createOffer(OWNER, {
        ...INPUT,
        pricing: {
          currency: 'BRL',
          priceOptions: [{ id: 'a', label: { 'pt-BR': 'A' }, unitAmountMinor: 150.9 }],
        },
        guideItemId: 'item-1',
        kind: 'tour',
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('publicar cria a projeção pública sem dono; pausar remove', async () => {
    const { service, port } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    const projection = port.publicOffers.get(offer.id);
    expect(projection).toMatchObject({ status: 'published' });
    expect(projection).not.toHaveProperty('ownerId');
    expect(projection).not.toHaveProperty('partnerId');
    await service.setOfferStatus(OWNER, offer.id, 'paused');
    expect(port.publicOffers.has(offer.id)).toBe(false);
  });

  it('verificação antes de publicar que recusa mantém a oferta fora do ar', async () => {
    const { service, port } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await expect(
      service.setOfferStatus(OWNER, offer.id, 'published', async () => {
        throw new Error('Stripe não está pronto');
      })
    ).rejects.toThrow('Stripe não está pronto');
    expect(port.publicOffers.has(offer.id)).toBe(false);
  });

  it('oferta de outro parceiro responde como inexistente', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await expect(
      service.setOfferStatus({ uid: 'intruso', admin: false }, offer.id, 'published')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('recorrência cria horários em UTC, ignora passados e repetidos', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    const recurrence = {
      mode: 'recurrence' as const,
      capacity: 10,
      startDate: '2026-11-01',
      endDate: '2026-11-03',
      weekdays: [0, 1, 2],
      times: ['08:00'],
    };
    const created = await service.createSlots(OWNER, offer.id, recurrence);
    // 01/11 08:00 local = 11:00Z, antes de NOW (12:00Z): fica de fora.
    expect(created.map((slot) => slot.startsAt)).toEqual([
      '2026-11-02T11:00:00.000Z',
      '2026-11-03T11:00:00.000Z',
    ]);
    expect(created[0]?.endsAt).toBe('2026-11-02T15:00:00.000Z');
    await expect(service.createSlots(OWNER, offer.id, recurrence)).resolves.toEqual([]);
  });

  it('mais de 200 horários por vez é recusado', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await expect(
      service.createSlots(OWNER, offer.id, {
        mode: 'recurrence',
        capacity: 5,
        startDate: '2026-11-02',
        endDate: '2027-02-28',
        weekdays: [0, 1, 2, 3, 4, 5, 6],
        times: ['08:00', '14:00'],
      })
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('horários públicos só de oferta publicada, sem dados internos', async () => {
    const { service } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await service.createSlots(OWNER, offer.id, {
      mode: 'list',
      capacity: 4,
      slots: [{ startsAt: '2026-11-05T11:00:00.000Z' }],
    });
    await expect(
      service.listAvailableSlots(offer.id, '2026-11-01T00:00:00.000Z', '2026-12-01T00:00:00.000Z')
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    const slots = await service.listAvailableSlots(
      offer.id,
      '2026-11-01T00:00:00.000Z',
      '2026-12-01T00:00:00.000Z'
    );
    expect(slots).toEqual([
      {
        id: expect.any(String),
        startsAt: '2026-11-05T11:00:00.000Z',
        endsAt: '2026-11-05T15:00:00.000Z',
        available: 4,
      },
    ]);
  });

  it('resumo público: menor preço e disponibilidade nos próximos 30 dias', async () => {
    const { service } = setup();
    await expect(service.getPublicOfferSummary('item-1')).resolves.toBeNull();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    await expect(service.getPublicOfferSummary('item-1')).resolves.toEqual({
      lowestUnitAmountMinor: 15000,
      hasAvailability: false,
    });
    await service.createSlots(OWNER, offer.id, {
      mode: 'list',
      capacity: 2,
      slots: [{ startsAt: '2026-11-05T11:00:00.000Z' }],
    });
    await expect(service.getPublicOfferSummary('item-1')).resolves.toEqual({
      lowestUnitAmountMinor: 15000,
      hasAvailability: true,
    });
  });

  describe('reagendamento de horário (D16 4A)', () => {
    function seeded() {
      const ctx = setup();
      ctx.port.offers.set('offer-1', {
        id: 'offer-1',
        ownerId: 'partner-1',
        partnerId: 'partner-1',
      } as never);
      ctx.port.slots.set('slot-1', {
        id: 'slot-1',
        offerId: 'offer-1',
        startsAt: '2026-11-10T11:00:00.000Z',
        capacityTotal: 4,
        capacityReserved: 0,
        capacitySold: 2,
        status: 'open',
        createdAt: '',
        updatedAt: '',
      });
      for (const [id, status] of [
        ['bk-1', 'confirmed'],
        ['bk-2', 'canceled'],
      ] as const) {
        ctx.port.bookings.set(id, {
          id,
          slotId: 'slot-1',
          status,
          offerSnapshot: { title: 'Passeio', startsAt: '2026-11-10T11:00:00.000Z' },
        } as never);
      }
      return ctx;
    }
    const CHANGE = { startsAt: '2026-11-12T11:00:00.000Z', reason: 'Mar agitado' };

    it('as reservas ativas valem na nova data, com a data do aviso', async () => {
      const { service, port } = seeded();
      const moved = await service.rescheduleSlot(OWNER, 'offer-1', 'slot-1', CHANGE);
      expect(moved.map((booking) => booking.id)).toEqual(['bk-1']);
      expect(port.slots.get('slot-1')?.startsAt).toBe(CHANGE.startsAt);
      expect(port.bookings.get('bk-1')).toMatchObject({
        offerSnapshot: { startsAt: CHANGE.startsAt },
        rescheduledAt: expect.any(String),
      });
      expect(port.bookings.get('bk-2')?.offerSnapshot.startsAt).toBe('2026-11-10T11:00:00.000Z');
    });

    it('data passada, horário cancelado ou oferta de outro parceiro são recusados', async () => {
      const { service, port } = seeded();
      await expect(
        service.rescheduleSlot(OWNER, 'offer-1', 'slot-1', {
          ...CHANGE,
          startsAt: '2026-10-30T11:00:00.000Z',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
      await expect(
        service.rescheduleSlot({ uid: 'outro', admin: false }, 'offer-1', 'slot-1', CHANGE)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
      const slot = port.slots.get('slot-1');
      if (slot) port.slots.set('slot-1', { ...slot, status: 'canceled' });
      await expect(
        service.rescheduleSlot(OWNER, 'offer-1', 'slot-1', CHANGE)
      ).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });
    });
  });
});
