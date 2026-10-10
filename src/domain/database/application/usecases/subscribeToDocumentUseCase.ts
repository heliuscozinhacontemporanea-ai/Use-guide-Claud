import { databaseAdapter } from '../../factory';

export function subscribeToDocumentUseCase<T>(
  collectionPath: string,
  id: string,
  callback: (data: T | null) => void,
  onError?: (error: Error) => void
): () => void {
  return databaseAdapter.subscribeToDocument<T>(collectionPath, id, callback, onError);
}
