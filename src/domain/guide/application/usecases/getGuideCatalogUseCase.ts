import { GuideCatalogPort, GuideCatalogSnapshot } from '../../ports/guideCatalogPort';

export function getGuideCatalogUseCase(port: GuideCatalogPort): Promise<GuideCatalogSnapshot> {
  return new Promise((resolve, reject) => {
    const unsubscribe = port.subscribe(
      (snapshot) => {
        unsubscribe();
        resolve(snapshot);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}
