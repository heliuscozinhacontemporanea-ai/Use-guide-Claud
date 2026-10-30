import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { buildSlotsPayload } from '../components/partner/SlotCreationForm';
import { fortalezaDateKey, fortalezaInputToIso, startOfFortalezaWeek } from './dates';
import { formatMinor, minorToReaisInput, parseReaisToMinor } from './money';
import { emptyOfferFormValues, offerFormToFields } from './offerFormMapping';
import { canEditUnitName, unitLabel } from './unitLabel';

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

describe('venda por pessoa ou grupo (D20)', () => {
  const tour = { ...emptyOfferFormValues('tour'), title: { 'pt-BR': 'Buggy', en: '', fr: '' } };

  it('grupo envia o tamanho e desliga os nomes; entrada de atração é sempre por pessoa', () => {
    const group = offerFormToFields({
      ...tour,
      sellingUnit: 'group',
      groupMaxPeople: 4,
      requiresParticipantNames: true,
    });
    expect(group).toMatchObject({
      sellingUnit: 'group',
      groupMaxPeople: 4,
      requiresParticipantNames: false,
    });
    const entry = offerFormToFields({
      ...emptyOfferFormValues('private_entry'),
      sellingUnit: 'group',
      requiresParticipantNames: true,
    });
    expect(entry).toMatchObject({ sellingUnit: 'person', requiresParticipantNames: true });
    expect(entry).not.toHaveProperty('groupMaxPeople');
  });
});

describe('unidade da reserva (D20)', () => {
  const t = ((key: string, options?: { n?: number }) =>
    key === 'serviceProof.units.person' ? `Pessoa ${options?.n}` : 'Grupo') as unknown as TFunction;
  const booking = {
    requiresParticipantNames: true,
    offer: { startsAt: '2026-11-10T12:00:00.000Z' },
  } as Parameters<typeof canEditUnitName>[0];
  const pass = { name: null, nameChanged: false, checkedInAt: null };

  it('rótulo usa o nome, "Pessoa n" ou o grupo', () => {
    expect(unitLabel(t, { sellingUnit: 'person', participantsCount: 3 }, 1)).toBe('Pessoa 2');
    expect(unitLabel(t, { sellingUnit: 'person', participantsCount: 3 }, 1, 'Ana')).toBe('Ana');
    expect(unitLabel(t, { sellingUnit: 'group', participantsCount: 1 }, 0)).toBe('Grupo');
    expect(unitLabel(t, { sellingUnit: 'group', participantsCount: 2 }, 1)).toBe('Grupo 2');
  });

  it('primeiro nome é livre; troca só uma vez e até 24 h antes; nada depois do check-in', () => {
    const early = new Date('2026-11-08T12:00:00.000Z');
    const late = new Date('2026-11-09T13:00:00.000Z');
    expect(canEditUnitName(booking, pass, late)).toBe(true);
    expect(canEditUnitName(booking, { ...pass, name: 'Ana' }, early)).toBe(true);
    expect(canEditUnitName(booking, { ...pass, name: 'Ana' }, late)).toBe(false);
    expect(canEditUnitName(booking, { ...pass, name: 'Ana', nameChanged: true }, early)).toBe(
      false
    );
    expect(canEditUnitName(booking, { ...pass, checkedInAt: 'x' }, early)).toBe(false);
    expect(canEditUnitName({ ...booking, requiresParticipantNames: false }, pass, early)).toBe(
      false
    );
  });
});
