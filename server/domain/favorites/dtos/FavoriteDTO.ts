import { FavoriteDocument } from '../ports/favoritesPort';
import { PublicResourceDTO } from '../../guide';

export class FavoriteDTO {
  static fromGuide(
    userId: string,
    itemCollection: 'items' | 'events',
    target: PublicResourceDTO
  ): FavoriteDocument {
    const partnerId = (target.partnerId as string) ?? (target.ownerId as string) ?? null;
    const itemTypeLabel =
      itemCollection === 'events' ? 'Evento' : (target.category as string) || '';
    const itemDetails = {
      name: (target.name as string) || (target.title as string) || '',
      description: (target.description as string) || '',
      image:
        (target.image as string) ||
        (target.imageUrl as string) ||
        (target.coverImage as string) ||
        '',
      location: (target.location as string) || '',
    };

    return {
      userId,
      itemId: target.id,
      itemCollection,
      itemTypeLabel,
      partnerId,
      itemDetails,
    };
  }
}
