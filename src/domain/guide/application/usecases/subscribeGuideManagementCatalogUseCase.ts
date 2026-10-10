import { guideManagementCatalogPort } from '../../factory';
import type { GuideManagementCatalogSnapshot } from '../../ports/guideManagementCatalogPort';

export function subscribeGuideManagementCatalogUseCase(
  ownerId: string | undefined,
  onUpdate: (snapshot: GuideManagementCatalogSnapshot) => void,
  onError: (error: Error) => void
): () => void {
  return guideManagementCatalogPort.subscribe(ownerId, onUpdate, onError);
}
