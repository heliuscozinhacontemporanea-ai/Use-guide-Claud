import { UserSession, AuthIdentity } from './auth';

export interface AuthPort {
  registerWithEmail(email: string, password: string): Promise<UserSession>;

  loginWithEmail(email: string, password: string): Promise<UserSession>;

  loginWithSocialGoogle(): Promise<UserSession>;

  logout(): Promise<void>;

  resetPassword(email: string): Promise<void>;

  verifyResetCode(code: string): Promise<string>;

  confirmReset(code: string, newPass: string): Promise<void>;

  subscribeToAuthState(callback: (session: UserSession | null) => void): () => void;

  reauthenticate(email: string, currentPassword: string): Promise<void>;

  /** Confirma a identidade de quem entrou com Google (não tem senha no Firebase Auth). */
  reauthenticateWithGoogle(): Promise<void>;

  /** Se a conta atual tem login por e-mail e senha. */
  hasPasswordSignIn(): boolean;

  changePassword(newPassword: string): Promise<void>;

  getCurrentUser(): AuthIdentity | null;

  getIdToken(forceRefresh?: boolean): Promise<string | null>;
}
