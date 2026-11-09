import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { EMULATOR_HOST, EMULATOR_PORTS, useEmulators } from './emulators';
import { firebaseApp } from './firebaseApp';

export const storage = getStorage(firebaseApp);
if (useEmulators) connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
