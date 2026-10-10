import { FirebaseAuthAdapter } from './adapters/firebaseAuthAdapter';
import type { AuthPort } from './types/authPort';
import {
  createLoginWithEmailUseCase,
  createRegisterWithEmailUseCase,
  createLoginWithGoogleUseCase,
  createLogoutUseCase,
  createGetIdTokenUseCase,
  createGetCurrentAuthUserUseCase,
  createSubscribeToAuthStateUseCase,
  createResetPasswordUseCase,
  createVerifyPasswordResetCodeUseCase,
  createConfirmPasswordResetUseCase,
  createReauthenticateUseCase,
  createChangePasswordUseCase,
} from './application/usecases';

const authPort: AuthPort = new FirebaseAuthAdapter();

export const loginWithEmailUseCase = createLoginWithEmailUseCase(authPort);
export const registerWithEmailUseCase = createRegisterWithEmailUseCase(authPort);
export const loginWithGoogleUseCase = createLoginWithGoogleUseCase(authPort);
export const logoutUseCase = createLogoutUseCase(authPort);
export const getIdTokenUseCase = createGetIdTokenUseCase(authPort);
export const getCurrentAuthUserUseCase = createGetCurrentAuthUserUseCase(authPort);
export const subscribeToAuthStateUseCase = createSubscribeToAuthStateUseCase(authPort);
export const resetPasswordUseCase = createResetPasswordUseCase(authPort);
export const verifyPasswordResetCodeUseCase = createVerifyPasswordResetCodeUseCase(authPort);
export const confirmPasswordResetUseCase = createConfirmPasswordResetUseCase(authPort);
export const reauthenticateUseCase = createReauthenticateUseCase(authPort);
export const changePasswordUseCase = createChangePasswordUseCase(authPort);
