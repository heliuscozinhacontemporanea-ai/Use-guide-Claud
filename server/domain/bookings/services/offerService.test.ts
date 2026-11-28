import { describe, expect, it } from 'vitest';
import { InMemoryBookingsAdapter } from '../adapters/inMemoryBookingsAdapter';
import type { ListingCardSummary } from '../../../shared/kernel/listingCardSummary';
import type { BookableItem, BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import { type OfferInput, OfferService } from './offerService';
import { SlotService } from './slotService';

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
            published: true,
            ...item,
          },
  };
  let counter = 0;
  const summaries = new Map<string, ListingCardSummary | null>();
  const service = new OfferService(
    port,
    items,
    {
      setItemCardSummary: async (itemId, summary) => {
        summaries.set(itemId, summary);
      },
    },
    () => NOW,
    () => {
      counter += 1;
      return `id${counter}`;
    }
  );
  return { port, service, summaries, slotService: new SlotService(port, () => NOW) };
}

describe('OfferService', () => {
  it('recusa contato ou chave Pix nos textos da oferta (C2/B37)', async () => {
    const { service } = setup();
    await expect(
      service.createOffer(OWNER, {
        ...INPUT,
        description: { 'pt-BR': 'Reserve pelo zap (88) 99999-0000' },
        guideItemId: 'item-1',
        kind: 'tour',
      })
    ).rejects.toMatchObject({ code: 'CONTACT_IN_TEXT' });
  });

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

  it('a oferta usa o fuso do estabelecimento ao criar e ao editar (D28)', async () => {
    const { service } = setup({ timeZone: 'America/Manaus' });
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    expect(offer.timeZone).toBe('America/Manaus');
    const updated = await service.updateOffer(OWNER, offer.id, { title: { 'pt-BR': 'Novo' } });
    expect(updated.timeZone).toBe('America/Manaus');
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

  it('aluguel vende por veículo do anúncio, com períodos e preço por hora (F3b)', async () => {
    const { service } = setup({ category: 'rental', vehicleTypes: ['Quadriciclo'] });
    const rental = {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'rental' as const,
      vehicle: 'Quadriciclo',
      sellingUnit: 'group' as const,
      groupMaxPeople: 2,
      pricing: {
        currency: 'BRL' as const,
        priceOptions: [
          { id: 'p1', label: { 'pt-BR': '08:00 · 4 h' }, unitAmountMinor: 30000 },
          { id: 'hourly', label: { 'pt-BR': 'Por hora' }, unitAmountMinor: 8000 },
        ],
      },
      fleet: {
        fixed: [{ id: 'p1', start: '08:00', minutes: 240 }],
        custom: { mode: 'hours' as const, minHours: 2 },
      },
    };
    await expect(service.createOffer(OWNER, rental)).resolves.toMatchObject({
      kind: 'rental',
      vehicle: 'Quadriciclo',
    });
    await expect(service.createOffer(OWNER, { ...rental, vehicle: 'Buggy' })).rejects.toMatchObject(
      { code: 'VALIDATION_ERROR' }
    );
  });

  it('só vai à venda com o anúncio publicado (B68)', async () => {
    const { service } = setup({ published: false });
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await expect(service.setOfferStatus(OWNER, offer.id, 'published')).rejects.toMatchObject({
      code: 'LISTING_NOT_PUBLISHED',
      statusCode: 422,
    });
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

  it('o cartão do anúncio ganha o "a partir de" ao publicar e perde ao pausar (D37 item 10)', async () => {
    const { service, summaries } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
      pricing: {
        currency: 'BRL',
        priceOptions: [
          { id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 18000 },
          { id: 'child', label: { 'pt-BR': 'Criança' }, unitAmountMinor: 9000 },
        ],
      },
      cancellationPolicy: 'moderate',
    });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    expect(summaries.get('item-1')).toEqual({
      fromPriceMinor: 9000,
      priceUnit: 'person',
      serviceFeeIncluded: false,
      durationMinutes: 240,
      freeCancellationHours: 120,
    });
    await service.setOfferStatus(OWNER, offer.id, 'paused');
    expect(summaries.get('item-1')).toBeNull();
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
    const { service, slotService } = setup();
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
    const created = await slotService.createSlots(OWNER, offer.id, recurrence);
    // 01/11 08:00 local = 11:00Z, antes de NOW (12:00Z): fica de fora.
    expect(created.map((slot) => slot.startsAt)).toEqual([
      '2026-11-02T11:00:00.000Z',
      '2026-11-03T11:00:00.000Z',
    ]);
    expect(created[0]?.endsAt).toBe('2026-11-02T15:00:00.000Z');
    await expect(slotService.createSlots(OWNER, offer.id, recurrence)).resolves.toEqual([]);
  });

  it('mais de 200 horários por vez é recusado', async () => {
    const { service, slotService } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await expect(
      slotService.createSlots(OWNER, offer.id, {
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
    const { service, slotService } = setup();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await slotService.createSlots(OWNER, offer.id, {
      mode: 'list',
      capacity: 4,
      slots: [{ startsAt: '2026-11-05T11:00:00.000Z' }],
    });
    await expect(
      slotService.listAvailableSlots(
        offer.id,
        '2026-11-01T00:00:00.000Z',
        '2026-12-01T00:00:00.000Z'
      )
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    const slots = await slotService.listAvailableSlots(
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
    const { service, slotService } = setup();
    await expect(slotService.getPublicOfferSummary('item-1')).resolves.toBeNull();
    const offer = await service.createOffer(OWNER, {
      ...INPUT,
      guideItemId: 'item-1',
      kind: 'tour',
    });
    await service.setOfferStatus(OWNER, offer.id, 'published');
    await expect(slotService.getPublicOfferSummary('item-1')).resolves.toEqual({
      lowestUnitAmountMinor: 15000,
      hasAvailability: false,
    });
    await slotService.createSlots(OWNER, offer.id, {
      mode: 'list',
      capacity: 2,
      slots: [{ startsAt: '2026-11-05T11:00:00.000Z' }],
    });
    await expect(slotService.getPublicOfferSummary('item-1')).resolves.toEqual({
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
      const { port, slotService } = seeded();
      const moved = await slotService.rescheduleSlot(OWNER, 'offer-1', 'slot-1', CHANGE);
      expect(moved.map((booking) => booking.id)).toEqual(['bk-1']);
      expect(port.slots.get('slot-1')?.startsAt).toBe(CHANGE.startsAt);
      expect(port.bookings.get('bk-1')).toMatchObject({
        offerSnapshot: { startsAt: CHANGE.startsAt },
        rescheduledAt: expect.any(String),
      });
      expect(port.bookings.get('bk-2')?.offerSnapshot.startsAt).toBe('2026-11-10T11:00:00.000Z');
    });

    it('data passada, horário cancelado ou oferta de outro parceiro são recusados', async () => {
      const { port, slotService } = seeded();
      await expect(
        slotService.rescheduleSlot(OWNER, 'offer-1', 'slot-1', {
          ...CHANGE,
          startsAt: '2026-10-30T11:00:00.000Z',
        })
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
      await expect(
        slotService.rescheduleSlot({ uid: 'outro', admin: false }, 'offer-1', 'slot-1', CHANGE)
      ).rejects.toMatchObject({ code: 'NOT_FOUND' });
      const slot = port.slots.get('slot-1');
      if (slot) port.slots.set('slot-1', { ...slot, status: 'canceled' });
      await expect(
        slotService.rescheduleSlot(OWNER, 'offer-1', 'slot-1', CHANGE)
      ).rejects.toMatchObject({ code: 'SLOT_UNAVAILABLE' });
    });
  });
});
