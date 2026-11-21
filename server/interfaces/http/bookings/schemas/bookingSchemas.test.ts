import { describe, expect, it } from 'vitest';
import {
  CheckInByCodeSchema,
  CreateBookingSchema,
  CreateOfferSchema,
  CreateSlotsSchema,
  EntryCheckInSchema,
  UpdateOfferSchema,
} from './bookingSchemas';

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

  it('busca no endereço é opção fechada da oferta', () => {
    expect(CreateOfferSchema.safeParse({ ...OFFER, pickupMode: 'buyer_address' }).success).toBe(
      true
    );
    expect(CreateOfferSchema.safeParse({ ...OFFER, pickupMode: 'hotel' }).success).toBe(false);
  });

  it('check-in: código e hora do aparelho; nada de reserva, dono ou pessoas vindo do cliente', () => {
    expect(CheckInByCodeSchema.safeParse({ code: 'k7m-4qx' }).success).toBe(true);
    expect(
      CheckInByCodeSchema.safeParse({ code: 'K7M4QX', capturedAt: '2026-11-10T11:02:00.000Z' })
        .success
    ).toBe(true);
    expect(CheckInByCodeSchema.safeParse({ code: 'K7M4QX', participantsPresent: 2 }).success).toBe(
      false
    );
    expect(CheckInByCodeSchema.safeParse({ code: 'K7M4QX', bookingId: 'x' }).success).toBe(false);
  });

  it('venda por grupo: de 1 a 50 por grupo ou veículo (o serviço pede 2 no passeio)', () => {
    expect(
      CreateOfferSchema.safeParse({ ...OFFER, sellingUnit: 'group', groupMaxPeople: 4 }).success
    ).toBe(true);
    expect(
      CreateOfferSchema.safeParse({ ...OFFER, sellingUnit: 'group', groupMaxPeople: 1 }).success
    ).toBe(true);
    expect(
      CreateOfferSchema.safeParse({ ...OFFER, sellingUnit: 'group', groupMaxPeople: 0 }).success
    ).toBe(false);
    expect(
      CreateOfferSchema.safeParse({ ...OFFER, sellingUnit: 'group', groupMaxPeople: 51 }).success
    ).toBe(false);
  });

  it('aluguel e translado: agenda de veículos e pedido de reserva por dia (F3b)', () => {
    const fleet = {
      fixed: [{ id: 'manha', start: '08:00', minutes: 240 }],
      custom: { mode: 'hours', minHours: 2 },
    };
    expect(CreateOfferSchema.safeParse({ ...OFFER, kind: 'rental', fleet }).success).toBe(true);
    expect(
      CreateOfferSchema.safeParse({
        ...OFFER,
        kind: 'rental',
        fleet: { ...fleet, fixed: [{ id: 'x', start: '25:00', minutes: 60 }] },
      }).success
    ).toBe(false);
    const booking = {
      offerId: 'offer-1',
      lines: [{ priceOptionId: 'manha', quantity: 1 }],
      locale: 'pt-BR',
      acceptedTermsVersion: 'v1',
    };
    expect(
      CreateBookingSchema.safeParse({
        ...booking,
        fleet: { date: '2026-11-21', periodId: 'manha' },
      }).success
    ).toBe(true);
    expect(CreateBookingSchema.safeParse({ ...booking, slotId: 'slot-1' }).success).toBe(true);
    // Nem horário nem dia, os dois juntos, ou período e horário escolhido ao mesmo tempo: recusa.
    expect(CreateBookingSchema.safeParse(booking).success).toBe(false);
    expect(
      CreateBookingSchema.safeParse({
        ...booking,
        slotId: 'slot-1',
        fleet: { date: '2026-11-21', periodId: 'manha' },
      }).success
    ).toBe(false);
    expect(
      CreateBookingSchema.safeParse({
        ...booking,
        fleet: { date: '2026-11-21', periodId: 'manha', startsAt: '2026-11-21T11:00:00.000Z' },
      }).success
    ).toBe(false);
  });

  it('entrada: QR ou código, nunca os dois nem nenhum (D20)', () => {
    const qr = `UGE1.${'a'.repeat(40)}.sig`;
    expect(EntryCheckInSchema.safeParse({ qrToken: qr }).success).toBe(true);
    expect(EntryCheckInSchema.safeParse({ code: 'ENTR:K7M4QXAB' }).success).toBe(true);
    expect(EntryCheckInSchema.safeParse({ qrToken: qr, code: 'K7M4QXAB' }).success).toBe(false);
    expect(EntryCheckInSchema.safeParse({}).success).toBe(false);
  });
});
