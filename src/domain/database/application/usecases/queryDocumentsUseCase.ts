import { databaseAdapter } from '../../factory';
import type { DatabaseOrderClause, DatabaseWhereClause } from '../../ports/databasePort';

export async function queryDocumentsUseCase<T = any>(
  collectionPath: string,
  where?: DatabaseWhereClause[],
  orderBy?: DatabaseOrderClause[],
  limitCount?: number
): Promise<T[]> {
  return databaseAdapter.queryDocuments<T>(collectionPath, where, orderBy, limitCount);
}
