import { FirebaseGuideCatalogAdapter } from './adapters/firebaseGuideCatalogAdapter';
import { FirebaseGuideManagementCatalogAdapter } from './adapters/firebaseGuideManagementCatalogAdapter';
import { subscribeGuideCatalogUseCase } from './application/usecases/subscribeGuideCatalogUseCase';
import { GuideCatalogPort } from './ports/guideCatalogPort';
import { GuideManagementCatalogPort } from './ports/guideManagementCatalogPort';

export const guideCatalogPort: GuideCatalogPort = new FirebaseGuideCatalogAdapter();
export const guideManagementCatalogPort: GuideManagementCatalogPort =
  new FirebaseGuideManagementCatalogAdapter();

export function subscribeGuideCatalog(
  onUpdate: Parameters<GuideCatalogPort['subscribe']>[0],
  onError: Parameters<GuideCatalogPort['subscribe']>[1]
) {
  return subscribeGuideCatalogUseCase(guideCatalogPort, onUpdate, onError);
}
