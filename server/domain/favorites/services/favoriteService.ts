import { FavoritesPort, FavoriteDocument } from '../ports/favoritesPort';
import { FavoriteDTO } from '../dtos/FavoriteDTO';
import { getItemByIdUseCase } from '../../guide';
import { getEventListingByIdUseCase } from '../../events';

export interface AddFavoriteServiceInput {
  userId: string;
  itemId: string;
  itemCollection: 'items' | 'events';
}

export class FavoriteService {
  constructor(private favoritesPort: FavoritesPort) {}

  async addFavorite(input: AddFavoriteServiceInput): Promise<void> {
    const { userId, itemId, itemCollection } = input;
    if (!userId || !itemId) {
      throw new Error('ID do usuário e ID do item são obrigatórios');
    }
    if (itemCollection !== 'items' && itemCollection !== 'events') {
      throw new Error('Coleção do item é obrigatória e deve ser items ou events');
    }

    const target =
      itemCollection === 'events'
        ? await getEventListingByIdUseCase(itemId)
        : await getItemByIdUseCase(itemId);

    if (!target) {
      throw new Error(
        itemCollection === 'events' ? 'Evento não encontrado' : 'Estabelecimento não encontrado'
      );
    }

    const favoriteDoc = FavoriteDTO.fromGuide(
      userId,
      itemCollection,
      target as unknown as Parameters<typeof FavoriteDTO.fromGuide>[2]
    );
    await this.favoritesPort.addFavorite(favoriteDoc);
  }

  async removeFavorite(
    userId: string,
    itemCollection: 'items' | 'events',
    itemId: string
  ): Promise<void> {
    if (!userId || !itemId) {
      throw new Error('ID do usuário e ID do item são obrigatórios');
    }
    if (itemCollection !== 'items' && itemCollection !== 'events') {
      throw new Error('Coleção do item é obrigatória e deve ser items ou events');
    }
    await this.favoritesPort.removeFavorite(userId, itemCollection, itemId);
  }

  async getUserFavorites(userId: string): Promise<FavoriteDocument[]> {
    if (!userId) {
      throw new Error('ID do usuário é obrigatório');
    }
    return this.favoritesPort.getUserFavorites(userId);
  }
}
