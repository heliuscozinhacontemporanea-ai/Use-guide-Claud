import { UserService } from './services/userService';
import { FirestoreUserAdapter } from './adapters/firestoreUserAdapter';

const userAdapter = new FirestoreUserAdapter();
export const userService = new UserService(userAdapter);
