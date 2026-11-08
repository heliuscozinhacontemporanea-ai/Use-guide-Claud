import { placeTimeOf } from '../../../shared/kernel/timeZones';
import type { BookableItemLookupPort } from '../ports/bookableItemLookupPort';
import type { BookingsPort } from '../ports/bookingsPort';
import { toPublicOffer } from './offerService';

/** Ofertas seguem o fuso e a cidade do estabelecimento quando ele muda de lugar (D28). */
export class OfferPlaceService {
  constructor(
    private readonly port: BookingsPort,
    private readonly items: BookableItemLookupPort,
    private readonly now: () => Date = () => new Date()
  ) {}

  async syncFromItem(guideItemId: string): Promise<void> {
    const item = await this.items.getItem(guideItemId);
    const place = item ? placeTimeOf(item) : {};
    if (!item || !place.timeZone) return;
    const offers = await this.port.listOffersByOwner(item.ownerId);
    for (const offer of offers) {
      if (offer.guideItemId !== guideItemId) continue;
      if (offer.timeZone === place.timeZone && offer.city === place.city) continue;
      const { city: _previousCity, ...rest } = offer;
      const updated = { ...rest, ...place, updatedAt: this.now().toISOString() };
      await this.port.saveOffer(updated);
      if (updated.status === 'published') {
        await this.port.upsertPublicOfferProjection(toPublicOffer(updated));
      }
    }
  }
}
