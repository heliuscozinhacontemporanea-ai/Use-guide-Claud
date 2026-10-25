import { describe, expect, it } from 'vitest';
import { buildSlotsPayload } from '../components/partner/SlotCreationForm';
import { fortalezaDateKey, fortalezaInputToIso, startOfFortalezaWeek } from './dates';
import { formatMinor, minorToReaisInput, parseReaisToMinor } from './money';
import { emptyOfferFormValues, offerFormToFields } from './offerFormMapping';

describe('dinheiro', () => {
  it('converte reais digitados em centavos inteiros', () => {
    expect(parseReaisToMinor('150,90')).toBe(15090);
    expect(parseReaisToMinor('150.9')).toBe(15090);
    expect(parseReaisToMinor('1.234,56')).toBe(123456);
    expect(parseReaisToMinor('R$ 80')).toBe(8000);
    expect(parseReaisToMinor('abc')).toBeNull();
    expect(parseReaisToMinor('')).toBeNull();
    expect(minorToReaisInput(15090)).toBe('150,90');
  });

  it('formata BRL no idioma pedido', () => {
    expect(formatMinor(15090, 'pt-BR')).toMatch(/R\$\s?150,90/);
    expect(formatMinor(15090, 'en')).toMatch(/R\$\s?150\.90/);
  });
});

describe('datas no fuso de Fortaleza', () => {
  it('converte o horário digitado em UTC e agrupa pelo dia local', () => {
    expect(fortalezaInputToIso('2026-11-02T08:00')).toBe('2026-11-02T11:00:00.000Z');
    expect(fortalezaDateKey('2026-11-03T01:30:00.000Z')).toBe('2026-11-02');
  });

  it('a semana começa no domingo 00:00 de Fortaleza', () => {
    // Quarta, 04/11/2026 10:00 local → domingo 01/11 00:00 local = 03:00Z.
    expect(startOfFortalezaWeek(new Date('2026-11-04T13:00:00.000Z')).toISOString()).toBe(
      '2026-11-01T03:00:00.000Z'
    );
  });
});

describe('formulário de oferta', () => {
  it('envia o preço em centavos e omite traduções vazias', () => {
    const values = emptyOfferFormValues('tour');
    values.title['pt-BR'] = 'Passeio';
    values.priceOptions = [{ id: 'adult', label: 'Adulto', amount: '150,90' }];
    const fields = offerFormToFields(values);
    expect(fields.pricing.priceOptions[0]?.unitAmountMinor).toBe(15090);
    expect(fields.title).toEqual({ 'pt-BR': 'Passeio' });
    expect(fields).not.toHaveProperty('description');
    expect(fields.cancellationPolicy).toBe('flexible');
  });
});

describe('criação de horários', () => {
  const base = {
    capacity: '8',
    startDate: '2026-11-02',
    endDate: '2026-11-30',
    times: '08:00, 14:30',
    single: '',
  };

  it('recorrência envia dias da semana e horários corretos', () => {
    expect(buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [5, 1] })).toEqual({
      mode: 'recurrence',
      capacity: 8,
      startDate: '2026-11-02',
      endDate: '2026-11-30',
      weekdays: [1, 5],
      times: ['08:00', '14:30'],
    });
  });

  it('horário inválido, sem dia da semana ou capacidade zero não monta o pedido', () => {
    expect(
      buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [1], times: '8h' })
    ).toBeNull();
    expect(buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [] })).toBeNull();
    expect(
      buildSlotsPayload({ ...base, mode: 'recurrence', weekdays: [1], capacity: '0' })
    ).toBeNull();
  });

  it('avulso converte a data local para UTC', () => {
    expect(
      buildSlotsPayload({ ...base, mode: 'list', weekdays: [], single: '2026-11-05T09:00' })
    ).toEqual({
      mode: 'list',
      capacity: 8,
      slots: [{ startsAt: '2026-11-05T12:00:00.000Z' }],
    });
  });
});
