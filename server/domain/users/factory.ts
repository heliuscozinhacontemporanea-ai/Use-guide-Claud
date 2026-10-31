import { UserService } from './services/userService';
import { FirestoreUserAdapter } from './adapters/firestoreUserAdapter';
import { FirestoreUsernameAdapter } from './adapters/firestoreUsernameAdapter';
import { UsernameService } from './services/usernameService';

const userAdapter = new FirestoreUserAdapter();
export const userService = new UserService(userAdapter);
export const usernameService = new UsernameService(new FirestoreUsernameAdapter());
