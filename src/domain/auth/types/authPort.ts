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

  changePassword(newPassword: string): Promise<void>;

  getCurrentUser(): AuthIdentity | null;

  getIdToken(forceRefresh?: boolean): Promise<string | null>;
}
