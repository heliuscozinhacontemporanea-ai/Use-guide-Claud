import { FirestoreUserAdapter } from './adapters/firestoreUserAdapter';
import { FirestoreUsernameAdapter } from './adapters/firestoreUsernameAdapter';
import { UsernameService } from './services/usernameService';
import { UserService } from './services/userService';

const userAdapter = new FirestoreUserAdapter();
export const userService = new UserService(userAdapter);
export const usernameService = new UsernameService(new FirestoreUsernameAdapter());
