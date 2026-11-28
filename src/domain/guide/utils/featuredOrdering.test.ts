import { describe, expect, it } from 'vitest';
import type { GuideItem } from '../types/guide';
import { orderWithFeatured } from './featuredOrdering';

const item = (id: string, rating = 0, reviewCount = 0, isVerified = false) =>
  ({
    id,
    name: id,
    description: '',
    category: 'hotel',
    image: '',
    location: '',
    rating,
    reviewCount,
    isVerified,
  }) as GuideItem;

describe('orderWithFeatured (D11, espaço pago do DESIGN.md §8)', () => {
  const organic = Array.from({ length: 14 }, (_, index) => item(`o${index}`, 5 - index * 0.1));
  const paid = [item('p1', 3), item('p2', 3), item('p3', 3)];

  it('vagas no 1º, 7º e 13º cartão, na ordem do sorteio, nunca duas seguidas', () => {
    const ordered = orderWithFeatured([...organic, ...paid], ['p2', 'p1', 'p3']);
    const ids = ordered.items.map((listing) => listing.id);
    expect(ids.indexOf('p2')).toBe(0);
    expect(ids.indexOf('p1')).toBe(6);
    expect(ids.indexOf('p3')).toBe(12);
    expect(ids.slice(1, 6)).toEqual(['o0', 'o1', 'o2', 'o3', 'o4']);
    expect([...ordered.featuredIds]).toEqual(['p2', 'p1', 'p3']);
  });

  it('o resto segue por nota e avaliações, sem favorecer o selo', () => {
    const items = [item('a', 4.2, 10, true), item('b', 4.8, 3), item('c', 4.8, 9), item('d', 3)];
    const ordered = orderWithFeatured(items, ['d']);
    expect(ordered.items.map((listing) => listing.id)).toEqual(['d', 'c', 'b', 'a']);
  });

  it('lista curta: vaga sem cartões normais antes dela volta à ordem normal, sem o rótulo', () => {
    const items = [item('a', 4.5), item('p1', 3), item('p2', 3)];
    const ordered = orderWithFeatured(items, ['p1', 'p2']);
    expect(ordered.items.map((listing) => listing.id)).toEqual(['p1', 'a', 'p2']);
    expect([...ordered.featuredIds]).toEqual(['p1']);
  });

  it('destaque que não está na lista (filtro ou inativo) é ignorado', () => {
    const items = [item('a', 4.2, 10, true), item('b', 4.8, 3), item('c', 4.8, 9), item('d', 3)];
    const ordered = orderWithFeatured(items, ['x']);
    expect(ordered.items.map((listing) => listing.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(ordered.featuredIds.size).toBe(0);
  });
});
