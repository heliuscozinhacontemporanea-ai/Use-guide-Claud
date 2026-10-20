import { getItemByIdUseCase } from '../../../domain/guide';
import {
  type ListingVerificationStatus,
  type ListingVerificationView,
  listListingVerificationsUseCase,
} from '../../../domain/partners';
import { getUserProfilesBatchUseCase } from '../../../domain/users';

/** Linha da fila do admin: a verificação com o nome do estabelecimento e de quem enviou. */
export interface ListingVerificationQueueEntry extends ListingVerificationView {
  listingName: string;
  listingCategory: string;
  ownerName: string;
}

export async function listListingVerificationsApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  status: ListingVerificationStatus,
  limit: number,
  cursor: string | null
): Promise<{ data: ListingVerificationQueueEntry[]; nextCursor: string | null }> {
  const page = await listListingVerificationsUseCase(actor, status, limit, cursor);
  // Perfil de produtor vinculado não tem documento próprio: segue o estabelecimento de origem.
  const reviewable = page.data.filter((view) => view.mode === 'document');
  if (reviewable.length === 0) return { data: [], nextCursor: page.nextCursor };

  const [items, owners] = await Promise.all([
    Promise.all(reviewable.map((view) => getItemByIdUseCase(view.itemId))),
    getUserProfilesBatchUseCase([...new Set(reviewable.map((view) => view.ownerId))]),
  ]);

  return {
    data: reviewable.map((view, index) => {
      const item = items[index];
      const owner = owners[view.ownerId];
      return {
        ...view,
        listingName: typeof item?.name === 'string' ? item.name : '',
        listingCategory: String(item?.category ?? ''),
        ownerName: [owner?.firstName, owner?.lastName].filter(Boolean).join(' '),
      };
    }),
    nextCursor: page.nextCursor,
  };
}
