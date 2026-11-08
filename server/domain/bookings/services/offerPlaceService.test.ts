import { describe, expect, it, vi } from 'vitest';
import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import type { BookingsPort } from '../ports/bookingsPort';
import type { BookableOffer } from '../types/bookingTypes';
import { OfferPlaceService } from './offerPlaceService';

const offer = (id: string, guideItemId: string, status: BookableOffer['status']) =>
  ({
    id,
    guideItemId,
    status,
    ownerId: 'o1',
    timeZone: 'America/Fortaleza',
    city: 'Jijoca',
  }) as BookableOffer;

describe('OfferPlaceService', () => {
  it('leva fuso e cidade do estabelecimento às ofertas dele e atualiza a projeção pública', async () => {
    const port = {
      listOffersByOwner: vi
        .fn()
        .mockResolvedValue([
          offer('a', 'item1', 'published'),
          offer('b', 'item1', 'draft'),
          offer('c', 'item2', 'published'),
        ]),
      saveOffer: vi.fn(),
      upsertPublicOfferProjection: vi.fn(),
    } as unknown as BookingsPort;
    const items: BookableItemLookupPort = {
      getItem: vi.fn().mockResolvedValue({
        id: 'item1',
        ownerId: 'o1',
        partnerId: 'o1',
        category: 'tour',
        name: 'X',
        timeZone: 'America/Manaus',
        city: 'Manaus',
      }),
    };
    const now = () => new Date('2026-11-08T12:00:00.000Z');
    await new OfferPlaceService(port, items, now).syncFromItem('item1');
    expect(port.saveOffer).toHaveBeenCalledTimes(2);
    expect(port.saveOffer).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'a', timeZone: 'America/Manaus', city: 'Manaus' })
    );
    expect(port.upsertPublicOfferProjection).toHaveBeenCalledTimes(1);
  });
});
