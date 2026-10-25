import { describe, expect, it } from 'vitest';
import { CreateOfferSchema, CreateSlotsSchema, UpdateOfferSchema } from './bookingSchemas';

const OFFER = {
  guideItemId: 'item-1',
  kind: 'tour',
  title: { 'pt-BR': 'Passeio' },
  pricing: {
    currency: 'BRL',
    priceOptions: [{ id: 'adult', label: { 'pt-BR': 'Adulto' }, unitAmountMinor: 15090 }],
  },
  cancellationPolicy: 'flexible',
  maxParticipantsPerBooking: 8,
  requiresParticipantNames: false,
};

describe('bookingSchemas', () => {
  it('aceita oferta válida', () => {
    expect(CreateOfferSchema.safeParse(OFFER).success).toBe(true);
  });

  it('recusa dono, parceiro ou status vindos do cliente', () => {
    expect(CreateOfferSchema.safeParse({ ...OFFER, ownerId: 'outro' }).success).toBe(false);
    expect(CreateOfferSchema.safeParse({ ...OFFER, status: 'published' }).success).toBe(false);
    expect(UpdateOfferSchema.safeParse({ partnerId: 'x' }).success).toBe(false);
  });

  it('preço em reais com casas decimais é recusado (só centavos inteiros)', () => {
    const pricing = {
      currency: 'BRL',
      priceOptions: [{ id: 'a', label: { 'pt-BR': 'A' }, unitAmountMinor: 150.9 }],
    };
    expect(CreateOfferSchema.safeParse({ ...OFFER, pricing }).success).toBe(false);
  });

  it('política de cancelamento só entre as opções da plataforma', () => {
    expect(
      CreateOfferSchema.safeParse({
        ...OFFER,
        cancellationPolicy: 'custom_30',
      }).success
    ).toBe(false);
  });

  it('horários: lista ou recorrência, com horário HH:MM válido', () => {
    expect(
      CreateSlotsSchema.safeParse({
        mode: 'list',
        capacity: 5,
        slots: [{ startsAt: '2026-11-02T11:00:00.000Z' }],
      }).success
    ).toBe(true);
    expect(
      CreateSlotsSchema.safeParse({
        mode: 'recurrence',
        capacity: 5,
        startDate: '2026-11-02',
        endDate: '2026-11-30',
        weekdays: [1, 3],
        times: ['08:00', '25:00'],
      }).success
    ).toBe(false);
  });
});
