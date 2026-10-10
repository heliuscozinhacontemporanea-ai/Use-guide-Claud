import { databaseAdapter } from '../../factory';
import type {
  DatabaseCursor,
  DatabaseOrderClause,
  DatabasePage,
  DatabaseWhereClause,
} from '../../ports/databasePort';

export async function queryDocumentsPageUseCase<T = any>(
  collectionPath: string,
  where?: DatabaseWhereClause[],
  orderBy?: DatabaseOrderClause[],
  limitCount?: number,
  cursor?: DatabaseCursor | null
): Promise<DatabasePage<T>> {
  return databaseAdapter.queryDocumentsPage<T>(
    collectionPath,
    where,
    orderBy,
    limitCount,
    cursor
  );
}
