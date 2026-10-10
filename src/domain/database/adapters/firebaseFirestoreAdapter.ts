import {
  collection,
  doc,
  getDoc,
  getDocFromCache,
  query,
  where,
  orderBy as fbOrderBy,
  limit as fbLimit,
  getDocs,
  getDocsFromCache,
  onSnapshot,
  serverTimestamp as fbServerTimestamp,
  startAfter,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../../../shared/infrastructure/firebase/firebaseFirestore';
import { auth } from '../../../shared/infrastructure/firebase/firebaseAuth';
import {
  DatabasePort,
  DatabaseWhereClause,
  DatabaseOrderClause,
  DatabaseCursor,
  DatabaseCursorValue,
  DatabasePage,
} from '../ports/databasePort';

export enum OperationType {
  LIST = 'list',
  GET = 'get',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function buildConstraints(
  whereClauses?: DatabaseWhereClause[],
  orderClauses?: DatabaseOrderClause[],
  limitCount?: number
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  whereClauses?.forEach((whereClause) => {
    constraints.push(where(whereClause.field, whereClause.op as any, whereClause.value));
  });
  orderClauses?.forEach((orderClause) => {
    constraints.push(fbOrderBy(orderClause.field, orderClause.direction || 'asc'));
  });
  if (limitCount && limitCount > 0) {
    constraints.push(fbLimit(limitCount));
  }
  return constraints;
}

function normalizeCursorValue(value: unknown): DatabaseCursorValue {
  if (value === null || value === undefined) {
    return null;
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => unknown }).toDate === 'function'
  ) {
    const d = (value as { toDate: () => unknown }).toDate();
    if (d instanceof Date) {
      return d;
    }
  }
  throw new Error('Valor de cursor Firestore não suportado');
}

function getCursorValues(
  document: Record<string, unknown>,
  orderClauses: DatabaseOrderClause[]
): DatabaseCursorValue[] {
  return orderClauses.map((orderClause) => normalizeCursorValue(document[orderClause.field]));
}

export class FirebaseFirestoreAdapter implements DatabasePort {
  async getDocument<T = any>(collectionPath: string, id: string): Promise<T | null> {
    try {
      const snap = await getDoc(doc(db, collectionPath, id));
      return snap.exists()
        ? ({
            id: snap.id,
            ...snap.data(),
          } as T)
        : null;
    } catch (error: any) {
      if (error?.message?.includes('client is offline')) {
        try {
          const cacheSnap = await getDocFromCache(doc(db, collectionPath, id));
          return cacheSnap.exists()
            ? ({
                id: cacheSnap.id,
                ...cacheSnap.data(),
              } as T)
            : null;
        } catch {
          return null;
        }
      }
      handleFirestoreError(error, OperationType.GET, `${collectionPath}/${id}`);
    }
  }

  async queryDocuments<T = any>(
    collectionPath: string,
    whereClauses?: DatabaseWhereClause[],
    orderClauses?: DatabaseOrderClause[],
    limitCount?: number
  ): Promise<T[]> {
    try {
      const constraints = buildConstraints(whereClauses, orderClauses, limitCount);
      const q = query(collection(db, collectionPath), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (document) =>
          ({
            id: document.id,
            ...document.data(),
          }) as T
      );
    } catch (error: any) {
      if (error?.message?.includes('client is offline')) {
        try {
          const constraints = buildConstraints(whereClauses, orderClauses, limitCount);
          const q = query(collection(db, collectionPath), ...constraints);
          const cacheSnap = await getDocsFromCache(q);
          return cacheSnap.docs.map(
            (document) =>
              ({
                id: document.id,
                ...document.data(),
              }) as T
          );
        } catch {
          return [];
        }
      }
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  }

  async queryDocumentsPage<T = any>(
    collectionPath: string,
    whereClauses?: DatabaseWhereClause[],
    orderClauses: DatabaseOrderClause[] = [],
    limitCount = 10,
    cursor?: DatabaseCursor | null
  ): Promise<DatabasePage<T>> {
    try {
      const pageLimit = Math.max(1, Math.min(limitCount, 50));
      const constraints = buildConstraints(whereClauses, orderClauses);
      if (cursor?.values.length) {
        if (cursor.values.length !== orderClauses.length) {
          throw new Error('Cursor incompatível com a ordenação da consulta');
        }
        constraints.push(startAfter(...cursor.values));
      }
      constraints.push(fbLimit(pageLimit + 1));
      const q = query(collection(db, collectionPath), ...constraints);
      const snapshot = await getDocs(q);
      const documents = snapshot.docs.slice(0, pageLimit);
      const hasMore = snapshot.docs.length > pageLimit;
      const lastDocument = documents[documents.length - 1];
      const nextCursor =
        hasMore && lastDocument
          ? {
              values: getCursorValues(lastDocument.data() as Record<string, unknown>, orderClauses),
            }
          : null;
      return {
        items: documents.map(
          (document) =>
            ({
              id: document.id,
              ...document.data(),
            }) as T
        ),
        cursor: nextCursor,
        hasMore,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  }

  subscribeToDocument<T = any>(
    collectionPath: string,
    id: string,
    onUpdate: (data: T | null) => void,
    onError?: (error: Error) => void
  ): () => void {
    return onSnapshot(
      doc(db, collectionPath, id),
      (snapshot) => {
        onUpdate(
          snapshot.exists()
            ? ({
                id: snapshot.id,
                ...snapshot.data(),
              } as T)
            : null
        );
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, `${collectionPath}/${id}`);
        } catch (wrappedError) {
          onError?.(wrappedError as Error);
        }
      }
    );
  }

  subscribeToCollection<T = any>(
    collectionPath: string,
    onUpdate: (items: T[]) => void,
    onError?: (error: Error) => void,
    whereClauses?: DatabaseWhereClause[],
    orderClauses?: DatabaseOrderClause[],
    limitCount?: number
  ): () => void {
    const constraints = buildConstraints(whereClauses, orderClauses, limitCount);
    const q = query(collection(db, collectionPath), ...constraints);
    return onSnapshot(
      q,
      (snapshot) => {
        onUpdate(
          snapshot.docs.map(
            (document) =>
              ({
                id: document.id,
                ...document.data(),
              }) as T
          )
        );
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, collectionPath);
        } catch (wrappedError) {
          onError?.(wrappedError as Error);
        }
      }
    );
  }

  serverTimestamp(): unknown {
    return fbServerTimestamp();
  }
}
