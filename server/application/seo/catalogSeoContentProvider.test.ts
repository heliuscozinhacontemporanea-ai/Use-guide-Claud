import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPublicGuideItemUseCase: vi.fn(),
  listPublicGuideItemsUseCase: vi.fn(),
  getEventListingByIdUseCase: vi.fn(),
  listEventOccurrencesUseCase: vi.fn(),
  listPublicEventListingsUseCase: vi.fn(),
}));

vi.mock('../../domain/guide', () => ({
  getPublicGuideItemUseCase: mocks.getPublicGuideItemUseCase,
  listPublicGuideItemsUseCase: mocks.listPublicGuideItemsUseCase,
}));
vi.mock('../../domain/events', () => ({
  getEventListingByIdUseCase: mocks.getEventListingByIdUseCase,
  listEventOccurrencesUseCase: mocks.listEventOccurrencesUseCase,
  listPublicEventListingsUseCase: mocks.listPublicEventListingsUseCase,
}));

import { CatalogSeoContentProvider } from './catalogSeoContentProvider';

describe('CatalogSeoContentProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('expõe só campos públicos do item', async () => {
    mocks.getPublicGuideItemUseCase.mockResolvedValue({
      id: 'a',
      name: 'Pousada',
      description: 'Vista mar',
      category: 'hotel',
      image: 'https://x/y.webp',
      location: 'prea',
      ownerId: 'owner-1',
      whatsappLink: 'https://wa.me/5588999999999',
      rating: 0,
      reviewCount: 0,
      isActive: true,
    });
    const item = await new CatalogSeoContentProvider().getGuideItem('a');
    expect(item).not.toHaveProperty('ownerId');
    expect(item).not.toHaveProperty('whatsappLink');
    expect(item).toMatchObject({ id: 'a', name: 'Pousada', category: 'hotel' });
  });

  it('não expõe evento rascunho ou não público', async () => {
    mocks.getEventListingByIdUseCase.mockResolvedValue({
      id: 'e',
      status: 'draft',
      visibility: 'public',
    });
    await expect(new CatalogSeoContentProvider().getEvent('e')).resolves.toBeNull();
    mocks.getEventListingByIdUseCase.mockResolvedValue({
      id: 'e',
      status: 'published',
      visibility: 'unlisted',
    });
    await expect(new CatalogSeoContentProvider().getEvent('e')).resolves.toBeNull();
    expect(mocks.listEventOccurrencesUseCase).not.toHaveBeenCalled();
  });

  it('descarta ocorrências canceladas e adiadas', async () => {
    mocks.getEventListingByIdUseCase.mockResolvedValue({
      id: 'e',
      title: 'Show',
      name: 'Show',
      description: 'd',
      status: 'published',
      visibility: 'public',
      location: { name: 'Praça' },
    });
    mocks.listEventOccurrencesUseCase.mockResolvedValue([
      { startsAt: '2026-11-01T20:00:00Z', endsAt: '2026-11-01T23:00:00Z', status: 'canceled' },
      { startsAt: '2026-11-02T20:00:00Z', endsAt: '2026-11-02T23:00:00Z', status: 'postponed' },
      { startsAt: '2026-11-03T20:00:00Z', endsAt: '2026-11-03T23:00:00Z', status: 'scheduled' },
    ]);
    const event = await new CatalogSeoContentProvider().getEvent('e');
    expect(mocks.listEventOccurrencesUseCase).toHaveBeenCalledWith('e', { publicOnly: true });
    expect(event?.occurrences).toEqual([
      {
        startsAt: '2026-11-03T20:00:00Z',
        endsAt: '2026-11-03T23:00:00Z',
        locationName: undefined,
        locationAddress: undefined,
      },
    ]);
  });
});
