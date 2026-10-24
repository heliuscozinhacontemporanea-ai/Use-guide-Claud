import { describe, expect, it } from 'vitest';
import { resolveFeaturedSlotsPerList } from './featuredSlots';

describe('resolveFeaturedSlotsPerList', () => {
  it('usa 3 vagas quando a variável não está configurada', () => {
    expect(resolveFeaturedSlotsPerList(undefined)).toBe(3);
    expect(resolveFeaturedSlotsPerList(' ')).toBe(3);
  });

  it('aceita inteiro entre 0 e 12', () => {
    expect(resolveFeaturedSlotsPerList('5')).toBe(5);
    expect(resolveFeaturedSlotsPerList('0')).toBe(0);
  });

  it('falha com valor inválido', () => {
    expect(() => resolveFeaturedSlotsPerList('três')).toThrow('FEATURED_SLOTS_PER_LIST');
    expect(() => resolveFeaturedSlotsPerList('2.5')).toThrow();
    expect(() => resolveFeaturedSlotsPerList('13')).toThrow();
  });
});
