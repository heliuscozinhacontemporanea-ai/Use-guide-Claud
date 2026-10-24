import { beforeEach, describe, expect, it, vi } from 'vitest';

const m = vi.hoisted(() => ({
  activePlans: vi.fn(),
  items: vi.fn(),
  events: vi.fn(),
  save: vi.fn(),
}));

vi.mock('../../../domain/partners', () => ({ listActivePlanItemIdsUseCase: m.activePlans }));
vi.mock('../../../domain/events', () => ({ listPublicEventListingsUseCase: m.events }));
vi.mock('../../../domain/guide', async () => {
  const rotation = await import('../../../domain/guide/utils/featuredRotation');
  const types = await import('../../../domain/guide/types/featuredListing');
  return {
    ...rotation,
    FEATURED_LISTS: types.FEATURED_LISTS,
    listPublicGuideItemsUseCase: m.items,
    saveFeaturedListingsUseCase: m.save,
  };
});

import type { FeaturedListingsProjection } from '../../../domain/guide/types/featuredListing';
import { refreshFeaturedListingsApplicationUseCase } from './refreshFeaturedListingsApplicationUseCase';

const NOW = new Date('2026-10-22T12:00:00Z');

function saved(list: string): FeaturedListingsProjection {
  const projections = (m.save.mock.calls.at(-1)?.[0] ?? []) as FeaturedListingsProjection[];
  const projection = projections.find((candidate) => candidate.list === list);
  if (!projection) throw new Error(`lista ${list} não gravada`);
  return projection;
}

describe('refreshFeaturedListingsApplicationUseCase (D11)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    m.activePlans.mockResolvedValue(['h1', 'h2', 'h3', 'h4', 'r1', 'tip1']);
    m.items.mockResolvedValue([
      { id: 'h1', category: 'hotel' },
      { id: 'h2', category: 'hotel' },
      { id: 'h3', category: 'hotel' },
      { id: 'h4', category: 'hotel' },
      { id: 'h5', category: 'hotel' },
      { id: 'r1', category: 'restaurant' },
      { id: 'tip1', category: 'tips' },
    ]);
    m.events.mockResolvedValue([
      { id: 'ev1', isActive: true, establishmentId: 'r1' },
      { id: 'ev2', isActive: true, establishmentId: 'h5' },
      { id: 'ev3', isActive: false, establishmentId: 'h1' },
      { id: 'ev4', isActive: true },
    ]);
  });

  it('3 vagas por lista, só estabelecimentos com plano, no dia do fuso do negócio', async () => {
    await expect(refreshFeaturedListingsApplicationUseCase(NOW)).resolves.toEqual({
      day: '2026-10-22',
      featured: 5,
    });
    const projections = m.save.mock.calls[0]?.[0] as FeaturedListingsProjection[];
    expect(projections.map((projection) => projection.list).sort()).toEqual(
      ['events', 'hotel', 'rental', 'restaurant', 'sight', 'tour', 'transfer'].sort()
    );
    expect(saved('hotel').listingIds).toHaveLength(3);
    expect(saved('hotel').listingIds.every((id) => ['h1', 'h2', 'h3', 'h4'].includes(id))).toBe(
      true
    );
    expect(saved('restaurant').listingIds).toEqual(['r1']);
    expect(saved('events').listingIds).toEqual(['ev1']);
    expect(saved('tour').listingIds).toEqual([]);
    expect(saved('hotel').day).toBe('2026-10-22');
  });

  it('mesmo dia, mesmo sorteio; FEATURED_SLOTS_PER_LIST muda as vagas', async () => {
    await refreshFeaturedListingsApplicationUseCase(NOW);
    const first = saved('hotel').listingIds;
    m.save.mockClear();
    await refreshFeaturedListingsApplicationUseCase(new Date('2026-10-22T20:00:00Z'));
    expect(saved('hotel').listingIds).toEqual(first);

    m.save.mockClear();
    vi.stubEnv('FEATURED_SLOTS_PER_LIST', '1');
    await refreshFeaturedListingsApplicationUseCase(NOW);
    expect(saved('hotel').listingIds).toHaveLength(1);
  });
});
