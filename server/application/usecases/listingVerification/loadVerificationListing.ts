import { getItemByIdUseCase } from '../../../domain/guide';
import type { VerificationListing } from '../../../domain/partners';

/** Estabelecimento como a verificação o enxerga: só id, dono e categoria. */
export async function loadVerificationListing(itemId: string): Promise<VerificationListing | null> {
  const item = await getItemByIdUseCase(itemId);
  if (!item || typeof item.ownerId !== 'string' || !item.ownerId) return null;
  return { id: item.id, ownerId: item.ownerId, category: String(item.category ?? '') };
}
