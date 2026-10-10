import { FirebaseGuideCatalogAdapter } from './adapters/firebaseGuideCatalogAdapter';
import { FirebaseGuideManagementCatalogAdapter } from './adapters/firebaseGuideManagementCatalogAdapter';
import { HttpGuideMutationAdapter } from './adapters/httpGuideMutationAdapter';
import { subscribeGuideCatalogUseCase } from './application/usecases/subscribeGuideCatalogUseCase';
import { GuideCatalogPort } from './ports/guideCatalogPort';
import { GuideManagementCatalogPort } from './ports/guideManagementCatalogPort';
import { GuideMutationPort } from './ports/guideMutationPort';

export const guideCatalogPort: GuideCatalogPort = new FirebaseGuideCatalogAdapter();
export const guideManagementCatalogPort: GuideManagementCatalogPort =
  new FirebaseGuideManagementCatalogAdapter();
export const guideMutationPort: GuideMutationPort = new HttpGuideMutationAdapter();

export function subscribeGuideCatalog(
  onUpdate: Parameters<GuideCatalogPort['subscribe']>[0],
  onError: Parameters<GuideCatalogPort['subscribe']>[1]
) {
  return subscribeGuideCatalogUseCase(guideCatalogPort, onUpdate, onError);
}
