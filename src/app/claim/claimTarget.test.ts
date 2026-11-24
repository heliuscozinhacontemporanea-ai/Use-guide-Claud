import { describe, expect, it } from 'vitest';
import type { GuideItem } from '../../domain/guide';
import { claimSuggestions, claimTargetOf } from './claimTarget';

const place = (over: Partial<GuideItem>): GuideItem =>
  ({
    id: 'item-1',
    name: 'Cantinho do Preá',
    category: 'restaurant',
    ownerId: 'useguide',
    state: 'CE',
    city: 'Jijoca de Jericoacoara',
    image: 'foto.jpg',
    ...over,
  }) as GuideItem;

describe('"Sou o dono" no app (D35)', () => {
  it('só lugar do Use Guide pode ser assumido', () => {
    expect(claimTargetOf(place({}))).toMatchObject({ itemId: 'item-1', name: 'Cantinho do Preá' });
    expect(claimTargetOf(place({ ownerId: 'partner-1' }))).toBeNull();
    expect(claimTargetOf(place({ category: 'tips' }))).toBeNull();
    expect(claimTargetOf(place({ category: 'event' }))).toBeNull();
  });

  it('sugere até 3 lugares do Use Guide com nome parecido na mesma cidade (3b)', () => {
    const items = [
      place({}),
      place({ id: 'item-2', city: 'Camocim' }),
      place({ id: 'item-3', ownerId: 'partner-1' }),
      place({ id: 'item-4', name: 'Pousada do Mar' }),
    ];
    const draft = { name: 'cantinho', state: 'CE', city: 'jijoca de jericoacoara' };
    expect(claimSuggestions(items, draft).map((target) => target.itemId)).toEqual(['item-1']);
    expect(claimSuggestions(items, { ...draft, name: 'ca' })).toEqual([]);
    expect(claimSuggestions(items, { ...draft, state: 'RN' })).toEqual([]);
  });
});
