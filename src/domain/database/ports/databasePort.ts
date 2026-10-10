export type DatabaseWhereOp = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in';

export interface DatabaseWhereClause {
  field: string;
  op: DatabaseWhereOp;
  value: unknown;
}

export interface DatabaseOrderClause {
  field: string;
  direction?: 'asc' | 'desc';
}

export type DatabaseCursorValue = string | number | boolean | Date | null;

export interface DatabaseCursor {
  values: DatabaseCursorValue[];
}

export interface DatabasePage<T> {
  items: T[];
  cursor: DatabaseCursor | null;
  hasMore: boolean;
}

export interface DatabasePort {
  getDocument<T = any>(collectionPath: string, id: string): Promise<T | null>;

  queryDocuments<T = any>(
    collectionPath: string,
    where?: DatabaseWhereClause[],
    orderBy?: DatabaseOrderClause[],
    limitCount?: number
  ): Promise<T[]>;

  queryDocumentsPage<T = any>(
    collectionPath: string,
    where?: DatabaseWhereClause[],
    orderBy?: DatabaseOrderClause[],
    limitCount?: number,
    cursor?: DatabaseCursor | null
  ): Promise<DatabasePage<T>>;

  subscribeToDocument<T = any>(
    collectionPath: string,
    id: string,
    onUpdate: (data: T | null) => void,
    onError?: (error: Error) => void
  ): () => void;

  subscribeToCollection<T = any>(
    collectionPath: string,
    onUpdate: (items: T[]) => void,
    onError?: (error: Error) => void,
    where?: DatabaseWhereClause[],
    orderBy?: DatabaseOrderClause[],
    limitCount?: number
  ): () => void;

  serverTimestamp(): unknown;
}
