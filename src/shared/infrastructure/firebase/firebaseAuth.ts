import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { firebaseApp } from './firebaseApp';
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
