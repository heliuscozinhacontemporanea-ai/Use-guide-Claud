import { describe, expect, it, vi } from 'vitest';
import { isActiveEvent, mapGuideItem } from './firebaseGuideCatalogAdapter';

describe('isActiveEvent', () => {
  it('rejeita evento sem data', () => {
    expect(
      isActiveEvent({
        id: 'event-1',
        name: 'Evento',
        description: '',
        category: 'event',
        image: '',
        location: '',
        isActive: true,
      })
    ).toBe(false);
  });

  it('mantém evento futuro', () => {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    expect(
      isActiveEvent({
        id: 'event-1',
        name: 'Evento',
        description: '',
        category: 'event',
        image: '',
        location: '',
        date,
        isActive: true,
      })
    ).toBe(true);
  });

  it('mantém evento em andamento até endDate', () => {
    vi.setSystemTime(new Date('2026-10-10T12:00:00.000Z'));

    expect(
      isActiveEvent({
        id: 'event-1',
        name: 'Evento',
        description: '',
        category: 'event',
        image: '',
        location: '',
        date: '2026-10-09T12:00:00.000Z',
        endDate: '2026-10-11T12:00:00.000Z',
        isActive: true,
      })
    ).toBe(true);

    vi.useRealTimers();
  });

  it('remove evento encerrado', () => {
    vi.setSystemTime(new Date('2026-10-12T12:00:00.000Z'));

    expect(
      isActiveEvent({
        id: 'event-1',
        name: 'Evento',
        description: '',
        category: 'event',
        image: '',
        location: '',
        date: '2026-10-09T12:00:00.000Z',
        endDate: '2026-10-11T12:00:00.000Z',
        isActive: true,
      })
    ).toBe(false);

    vi.useRealTimers();
  });
});

describe('mapGuideItem', () => {
  it('mapeia campos corretamente e remove/ignora cpfCnpj', () => {
    const rawRecord = {
      id: 'item-10',
      name: 'Pousada Areia Branca',
      description: 'Ótima localização',
      category: 'hotel',
      image: 'https://img.com/pousada.jpg',
      images: ['https://img.com/1.jpg'],
      location: 'Jericoacoara',
      rating: 4.8,
      reviewCount: 42,
      isVerified: true,
      verifiedUntil: '2027-01-01',
      verificationType: 'annual',
      ownerId: 'owner-123',
      partnerId: 'partner-456',
      endDate: '2027-01-01T00:00:00.000Z',
      operationalInfo: {
        price: 'R$ 350',
        amenities: ['wifi', 'ar-condicionado'],
      },
      cpfCnpj: '12.345.678/0001-90',
    };

    const item = mapGuideItem(rawRecord);

    expect(item.id).toBe('item-10');
    expect(item.name).toBe('Pousada Areia Branca');
    expect(item.ownerId).toBe('owner-123');
    expect(item.partnerId).toBe('partner-456');
    expect(item.rating).toBe(4.8);
    expect(item.reviewCount).toBe(42);
    expect(item.isVerified).toBe(true);
    expect(item.endDate).toBe('2027-01-01T00:00:00.000Z');
    expect(item.operationalInfo?.price).toBe('R$ 350');
    expect('cpfCnpj' in item).toBe(false);
  });
});

describe('FirebaseGuideCatalogAdapter realtime', () => {
  it('desliga ambas as subscrições de items e events ao executar unsubscribe', async () => {
    const databaseDomain = await import('../../database');
    const unsubscribeItems = vi.fn();
    const unsubscribeEvents = vi.fn();

    vi.spyOn(databaseDomain, 'subscribeToCollectionUseCase').mockImplementation(
      (collectionName) => {
        if (collectionName === 'items') return unsubscribeItems;
        if (collectionName === 'events') return unsubscribeEvents;
        return vi.fn();
      }
    );

    const { FirebaseGuideCatalogAdapter } = await import('./firebaseGuideCatalogAdapter');
    const adapter = new FirebaseGuideCatalogAdapter();

    const onUpdate = vi.fn();
    const onError = vi.fn();
    const unsubscribe = adapter.subscribe(onUpdate, onError);

    expect(databaseDomain.subscribeToCollectionUseCase).toHaveBeenCalledWith(
      'items',
      expect.any(Function),
      onError
    );
    expect(databaseDomain.subscribeToCollectionUseCase).toHaveBeenCalledWith(
      'events',
      expect.any(Function),
      onError
    );

    unsubscribe();

    expect(unsubscribeItems).toHaveBeenCalledTimes(1);
    expect(unsubscribeEvents).toHaveBeenCalledTimes(1);
  });
});
