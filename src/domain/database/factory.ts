import { FirebaseFirestoreAdapter } from './adapters/firebaseFirestoreAdapter';
import { DatabasePort } from './ports/databasePort';

export const databaseAdapter: DatabasePort = new FirebaseFirestoreAdapter();
