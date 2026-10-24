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

describe('orderWithFeatured (D11)', () => {
  const items = [item('a', 4.2, 10, true), item('b', 4.8, 3), item('c', 4.8, 9), item('d', 3)];

  it('destaques no topo na ordem do sorteio; o resto por nota e avaliações, sem favorecer o selo', () => {
    const ordered = orderWithFeatured(items, ['d', 'a']);
    expect(ordered.items.map((listing) => listing.id)).toEqual(['d', 'a', 'c', 'b']);
    expect([...ordered.featuredIds]).toEqual(['d', 'a']);
  });

  it('destaque que não está na lista (filtro ou inativo) é ignorado', () => {
    const ordered = orderWithFeatured(items, ['x']);
    expect(ordered.items.map((listing) => listing.id)).toEqual(['c', 'b', 'a', 'd']);
    expect(ordered.featuredIds.size).toBe(0);
  });
});
