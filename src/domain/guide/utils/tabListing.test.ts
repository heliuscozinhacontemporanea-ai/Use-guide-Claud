import { describe, expect, it } from 'vitest';
import type { GuideItem } from '../types/guide';
import { orderTabListing } from './tabListing';

const item = (id: string, category: GuideItem['category'], rating = 0): GuideItem =>
  ({
    id,
    name: id,
    description: '',
    category,
    image: '',
    location: 'Jericoacoara',
    rating,
  }) as GuideItem;

describe('orderTabListing (D37)', () => {
  const items = [
    item('t1', 'tour', 4.2),
    item('t2', 'tour', 4.9),
    item('s1', 'sight', 4.5),
    item('h1', 'hotel', 5),
  ];
  const events = [item('e1', 'event'), item('e2', 'event')];

  it('uma categoria: vagas do dia no topo, o resto por nota', () => {
    const { items: list, featuredIds } = orderTabListing('tours', items, events, { tour: ['t1'] });
    expect(list.map((i) => i.id)).toEqual(['t1', 't2']);
    expect([...featuredIds]).toEqual(['t1']);
  });

  it('"Todas" alterna as categorias e não põe vaga paga no topo', () => {
    const { items: list, featuredIds } = orderTabListing('experiences', items, events, {
      tour: ['t1'],
    });
    expect(list.map((i) => i.id)).toEqual(['t2', 'e1', 's1', 't1', 'e2']);
    expect(featuredIds.size).toBe(0);
  });

  it('serviços não trazem experiências', () => {
    const { items: list } = orderTabListing('services', items, events, {});
    expect(list.map((i) => i.id)).toEqual(['h1']);
  });
});
