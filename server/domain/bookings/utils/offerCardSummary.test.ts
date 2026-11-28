import { describe, expect, it } from 'vitest';
import type { BookableOffer } from '../types/bookingTypes';
import { itemCardSummary, offerCardSummary } from './offerCardSummary';

const offer = (patch: Partial<BookableOffer>): BookableOffer =>
  ({
    id: 'o1',
    guideItemId: 'item-1',
    ownerId: 'p1',
    partnerId: 'p1',
    kind: 'tour',
    title: { 'pt-BR': 'Passeio' },
    status: 'published',
    pricing: { currency: 'BRL', priceOptions: [] },
    cancellationPolicy: 'flexible',
    maxParticipantsPerBooking: 8,
    requiresParticipantNames: false,
    createdAt: '',
    updatedAt: '',
    ...patch,
  }) as BookableOffer;

const price = (id: string, unitAmountMinor: number) => ({
  id,
  label: { 'pt-BR': id },
  unitAmountMinor,
});

describe('offerCardSummary (D37 item 10)', () => {
  it('por grupo, com a duração e o cancelamento grátis da política', () => {
    expect(
      offerCardSummary(
        offer({
          sellingUnit: 'group',
          durationMinutes: 300,
          pricing: { currency: 'BRL', priceOptions: [price('buggy', 60000)] },
        })
      )
    ).toEqual({
      fromPriceMinor: 60000,
      priceUnit: 'group',
      serviceFeeIncluded: false,
      durationMinutes: 300,
      freeCancellationHours: 24,
    });
  });

  it('aluguel: preço do veículo; só com horário personalizado, o preço da hora', () => {
    const byVehicle = offerCardSummary(
      offer({
        kind: 'rental',
        pricing: { currency: 'BRL', priceOptions: [price('dia', 35000), price('hourly', 6000)] },
      })
    );
    expect(byVehicle).toMatchObject({ fromPriceMinor: 35000, priceUnit: 'vehicle' });
    const hourly = offerCardSummary(
      offer({ kind: 'rental', pricing: { currency: 'BRL', priceOptions: [price('hourly', 6000)] } })
    );
    expect(hourly).toMatchObject({ fromPriceMinor: 6000, priceUnit: 'hour' });
  });

  it('política sem reembolso integral não promete cancelamento grátis', () => {
    const summary = offerCardSummary(
      offer({
        cancellationPolicy: 'strict',
        pricing: { currency: 'BRL', priceOptions: [price('a', 10000)] },
      })
    );
    expect(summary).not.toHaveProperty('freeCancellationHours');
  });

  it('o anúncio fica com a oferta à venda mais barata; sem oferta à venda, sem preço', () => {
    const cheap = offer({
      id: 'o2',
      status: 'paused',
      pricing: { currency: 'BRL', priceOptions: [price('a', 5000)] },
    });
    const onSale = offer({ pricing: { currency: 'BRL', priceOptions: [price('a', 12000)] } });
    expect(itemCardSummary([cheap, onSale])).toMatchObject({ fromPriceMinor: 12000 });
    expect(itemCardSummary([cheap])).toBeNull();
  });
});
