import { describe, expect, it } from 'vitest';
import { buildFirstSteps, type FirstStepsInput } from './buildFirstSteps';

const base: FirstStepsInput = {
  establishments: [{ id: 'buggy', category: 'tour' }],
  verifications: [],
  accounts: [],
  offers: [],
  events: [],
};

describe('buildFirstSteps', () => {
  it('parceiro de passeio novo: os três passos, conta travada até verificar', () => {
    const result = buildFirstSteps(base);
    expect(result?.segment).toBe('tours');
    expect(result?.title).toBe('prepare');
    expect(result?.steps.map((step) => [step.id, step.done, step.state])).toEqual([
      ['verify', false, undefined],
      ['account', false, 'locked'],
      ['offer', false, undefined],
    ]);
  });

  it('verificação enviada fica em análise e libera a conta', () => {
    const result = buildFirstSteps({
      ...base,
      verifications: [{ itemId: 'buggy', status: 'pending' }],
    });
    expect(result?.steps[0]).toMatchObject({ id: 'verify', done: false, state: 'pending' });
    expect(result?.steps[1]?.state).toBe('locked');
  });

  it('tudo feito no passeio: some; aluguel novo vira "Comece a vender"', () => {
    const ready = {
      ...base,
      verifications: [{ itemId: 'buggy', status: 'approved' }],
      accounts: [{ itemIds: ['buggy'], account: { readyForSales: true } }],
      offers: [{ guideItemId: 'buggy', kind: 'tour' }],
    };
    expect(buildFirstSteps(ready)).toBeNull();
    const withRental = buildFirstSteps({
      ...ready,
      establishments: [...ready.establishments, { id: 'quadri', category: 'rental' }],
      verifications: [...ready.verifications, { itemId: 'quadri', status: 'approved' }],
      accounts: [{ itemIds: ['buggy', 'quadri'], account: { readyForSales: true } }],
    });
    expect(withRental?.segment).toBe('rentals');
    expect(withRental?.title).toBe('start');
    expect(withRental?.steps.map((step) => step.done)).toEqual([true, true, false]);
  });

  it('restaurante: só verificar', () => {
    const result = buildFirstSteps({
      ...base,
      establishments: [{ id: 'cantinho', category: 'restaurant' }],
    });
    expect(result).toMatchObject({ segment: 'restaurant', title: 'complete' });
    expect(result?.steps.map((step) => step.id)).toEqual(['verify']);
  });

  it('produtor: o terceiro passo é criar o primeiro evento', () => {
    const result = buildFirstSteps({
      ...base,
      establishments: [{ id: 'davi', category: 'producer' }],
    });
    expect(result?.steps.map((step) => step.id)).toEqual(['verify', 'account', 'event']);
  });
});
