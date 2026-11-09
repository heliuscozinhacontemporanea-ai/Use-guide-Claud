import { connectAuthEmulator, getAuth, GoogleAuthProvider } from 'firebase/auth';
import { EMULATOR_HOST, EMULATOR_PORTS, useEmulators } from './emulators';
import { firebaseApp } from './firebaseApp';
export const auth = getAuth(firebaseApp);
if (useEmulators) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, {
    disableWarnings: true,
  });
}
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
