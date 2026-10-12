import { queryDocumentsUseCase } from '../../database';
import type { PublicOffer } from '../types/bookings';

/**
 * Leitura direta da projeção pública (AGENTS.md §6.2): só ofertas publicadas, com limite.
 * O filtro por status é obrigatório: a rule só libera documentos com status 'published'.
 */
export async function fetchPublishedOffersForItem(guideItemId: string): Promise<PublicOffer[]> {
  const docs = await queryDocumentsUseCase<Omit<PublicOffer, 'id'> & { id?: string }>(
    'publicBookableOffers',
    [
      { field: 'guideItemId', op: '==', value: guideItemId },
      { field: 'status', op: '==', value: 'published' },
    ],
    undefined,
    10
  );
  return docs.map((doc) => doc as PublicOffer);
}
