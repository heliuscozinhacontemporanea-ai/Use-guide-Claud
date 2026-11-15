import { describe, expect, it } from 'vitest';
import type { ListingStep } from '../../../domain/guide';
import { buildFirstSteps, type FirstStepsInput } from './buildFirstSteps';

const DONE: ListingStep[] = [
  { id: 'name', done: true, missing: [] },
  { id: 'photos', done: true, missing: [] },
];
const OPEN: ListingStep[] = [
  { id: 'name', done: true, missing: [] },
  { id: 'photos', done: false, missing: ['images'] },
];

const establishment = (
  id: string,
  category: string,
  publication: 'draft' | 'published' = 'published',
  setupSteps: ListingStep[] = DONE
) => ({ id, name: id, category, publication, setupSteps });

const base: FirstStepsInput = {
  establishments: [establishment('buggy', 'tour')],
  verifications: [],
  accounts: [],
  offers: [],
  offersWithSlots: new Set(),
  events: [],
};

const readyToSell: FirstStepsInput = {
  ...base,
  verifications: [{ itemId: 'buggy', status: 'approved' }],
  accounts: [{ itemIds: ['buggy'], account: { readyForSales: true } }],
  offers: [{ id: 'offer-1', guideItemId: 'buggy', kind: 'tour' }],
  offersWithSlots: new Set(['offer-1']),
};

describe('buildFirstSteps', () => {
  it('passeio novo: verificar, conta (travada), primeira oferta e horários (travados)', () => {
    const result = buildFirstSteps(base);
    expect(result?.segment).toBe('tours');
    expect(result?.title).toBe('prepare');
    expect(result?.steps.map((step) => [step.id, step.done, step.state])).toEqual([
      ['verify', false, undefined],
      ['account', false, 'locked'],
      ['offer', false, undefined],
      ['slots', false, 'locked'],
    ]);
  });

  it('rascunho: o cartão acompanha o anúncio com os passos de "Para aparecer no guia"', () => {
    const result = buildFirstSteps({
      ...readyToSell,
      establishments: [establishment('buggy', 'tour', 'draft', OPEN)],
    });
    expect(result?.listing).toEqual({
      itemId: 'buggy',
      name: 'buggy',
      publication: 'draft',
      steps: OPEN,
    });
    // Tudo pronto para vender, mas ainda é rascunho: o cartão continua.
    const complete = buildFirstSteps({
      ...readyToSell,
      establishments: [establishment('buggy', 'tour', 'draft', DONE)],
    });
    expect(complete?.listing.publication).toBe('draft');
  });

  it('publicado com passo em aberto (anúncio antigo) continua no cartão', () => {
    const result = buildFirstSteps({
      ...readyToSell,
      establishments: [establishment('buggy', 'tour', 'published', OPEN)],
    });
    expect(result?.listing.steps).toEqual(OPEN);
  });

  it('com dois anúncios do segmento, acompanha o rascunho', () => {
    const result = buildFirstSteps({
      ...base,
      establishments: [establishment('buggy', 'tour'), establishment('lancha', 'tour', 'draft')],
    });
    expect(result?.listing.itemId).toBe('lancha');
    expect(result?.steps.every((step) => step.itemId === 'lancha')).toBe(true);
  });

  it('verificação enviada fica em análise; a conta segue travada', () => {
    const result = buildFirstSteps({
      ...base,
      verifications: [{ itemId: 'buggy', status: 'pending' }],
    });
    expect(result?.steps[0]).toMatchObject({ id: 'verify', done: false, state: 'pending' });
    expect(result?.steps[1]?.state).toBe('locked');
  });

  it('horários: libera com a oferta e fica feito com um horário aberto', () => {
    const noSlots = buildFirstSteps({ ...readyToSell, offersWithSlots: new Set() });
    expect(noSlots?.steps.at(-1)).toEqual({ id: 'slots', done: false, itemId: 'buggy' });
  });

  it('tudo feito no passeio: some; aluguel novo vira "Comece a vender"', () => {
    expect(buildFirstSteps(readyToSell)).toBeNull();
    const withRental = buildFirstSteps({
      ...readyToSell,
      establishments: [...readyToSell.establishments, establishment('quadri', 'rental')],
      verifications: [...readyToSell.verifications, { itemId: 'quadri', status: 'approved' }],
      accounts: [{ itemIds: ['buggy', 'quadri'], account: { readyForSales: true } }],
    });
    expect(withRental?.segment).toBe('rentals');
    expect(withRental?.title).toBe('start');
    expect(withRental?.steps.map((step) => step.done)).toEqual([true, true, false, false]);
  });

  it('restaurante: só verificar, com o anúncio junto', () => {
    const result = buildFirstSteps({
      ...base,
      establishments: [establishment('cantinho', 'restaurant', 'draft', OPEN)],
    });
    expect(result).toMatchObject({ segment: 'restaurant', title: 'complete' });
    expect(result?.steps.map((step) => step.id)).toEqual(['verify']);
    expect(result?.listing.itemId).toBe('cantinho');
  });

  it('produtor: verificar, conta e o primeiro evento', () => {
    const result = buildFirstSteps({
      ...base,
      establishments: [establishment('davi', 'producer', 'published', [DONE[0] as ListingStep])],
    });
    expect(result?.steps.map((step) => step.id)).toEqual(['verify', 'account', 'event']);
    expect(result?.listing.steps.map((step) => step.id)).toEqual(['name']);
  });
});
