import { GuideCatalogPort, GuideCatalogSnapshot } from '../../ports/guideCatalogPort';

export function subscribeGuideCatalogUseCase(
  port: GuideCatalogPort,
  onUpdate: (snapshot: GuideCatalogSnapshot) => void,
  onError: (error: Error) => void
): () => void {
  return port.subscribe(onUpdate, onError);
}
