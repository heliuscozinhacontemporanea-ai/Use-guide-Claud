/**
 * Emuladores do Firebase só no desenvolvimento local (`VITE_USE_EMULATORS=true`, `npm run dev:emulators`).
 * O build de produção ignora a chave: assim o app publicado nunca aponta para um emulador.
 */
export const useEmulators = import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true';

export const EMULATOR_HOST = '127.0.0.1';
export const EMULATOR_PORTS = { auth: 9099, firestore: 8085, storage: 9199 } as const;
