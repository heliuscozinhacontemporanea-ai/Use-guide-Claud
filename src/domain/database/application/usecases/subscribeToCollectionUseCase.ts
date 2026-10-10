import { databaseAdapter } from '../../factory';
import type { DatabaseOrderClause, DatabaseWhereClause } from '../../ports/databasePort';

export function subscribeToCollectionUseCase<T = any>(
  collectionPath: string,
  onUpdate: (items: T[]) => void,
  onError?: (error: Error) => void,
  where?: DatabaseWhereClause[],
  orderBy?: DatabaseOrderClause[],
  limitCount?: number
): () => void {
  return databaseAdapter.subscribeToCollection<T>(
    collectionPath,
    onUpdate,
    onError,
    where,
    orderBy,
    limitCount
  );
}
