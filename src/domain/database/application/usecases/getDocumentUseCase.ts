import { databaseAdapter } from '../../factory';

export async function getDocumentUseCase<T = any>(
  collectionPath: string,
  id: string
): Promise<T | null> {
  return databaseAdapter.getDocument<T>(collectionPath, id);
}
