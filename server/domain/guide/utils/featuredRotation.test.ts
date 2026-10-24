import { describe, expect, it } from 'vitest';
import { featuredRotationDay, pickFeaturedListingIds } from './featuredRotation';

const IDS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

describe('featuredRotation (D11)', () => {
  it('dia do rodízio segue o fuso America/Fortaleza', () => {
    expect(featuredRotationDay(new Date('2026-10-22T02:59:00Z'))).toBe('2026-10-21');
    expect(featuredRotationDay(new Date('2026-10-22T03:00:00Z'))).toBe('2026-10-22');
  });

  it('mesma semente dá o mesmo sorteio, qualquer que seja a ordem dos candidatos', () => {
    const first = pickFeaturedListingIds(IDS, '2026-10-22:hotel', 3);
    expect(first).toHaveLength(3);
    expect(pickFeaturedListingIds([...IDS].reverse(), '2026-10-22:hotel', 3)).toEqual(first);
  });

  it('o sorteio muda com o dia e só devolve candidatos sem repetir', () => {
    const days = Array.from({ length: 10 }, (_, day) =>
      pickFeaturedListingIds(IDS, `2026-10-${10 + day}:hotel`, 3).join(',')
    );
    expect(new Set(days).size).toBeGreaterThan(1);
    for (const picked of days.map((day) => day.split(','))) {
      expect(new Set(picked).size).toBe(3);
      expect(picked.every((id) => IDS.includes(id))).toBe(true);
    }
  });

  it('menos candidatos que vagas devolve todos; zero vagas devolve nenhum', () => {
    expect(pickFeaturedListingIds(['x', 'y'], 'k', 3).sort()).toEqual(['x', 'y']);
    expect(pickFeaturedListingIds(IDS, 'k', 0)).toEqual([]);
  });
});
