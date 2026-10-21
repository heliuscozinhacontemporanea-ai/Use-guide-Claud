import {
  type ListingVerificationView,
  listLinkedListingIdsUseCase,
  reviewListingVerificationUseCase,
  type VerificationDecision,
} from '../../../domain/partners';
import { syncListingSealApplicationUseCase } from './syncListingSealApplicationUseCase';

/**
 * Revisão do admin (D12) e recálculo do selo: o do estabelecimento e o dos perfis de produtor que
 * usam o documento dele, porque o selo só aparece com verificação aprovada (D11).
 */
export async function reviewListingVerificationApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string,
  decision: VerificationDecision,
  reason: string | null
): Promise<ListingVerificationView> {
  const view = await reviewListingVerificationUseCase(actor, itemId, decision, reason);
  const linked = await listLinkedListingIdsUseCase(itemId);
  for (const id of [itemId, ...linked]) {
    await syncListingSealApplicationUseCase(id);
  }
  return view;
}
