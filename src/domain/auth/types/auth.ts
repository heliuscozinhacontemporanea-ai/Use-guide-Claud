export enum UserRole {
  ADMIN = 'admin',
  PARTNER = 'partner',
  USER = 'user',
}

export interface AuthIdentity {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
}

export interface UserSession extends AuthIdentity {
  role: UserRole;
}

/**
 * Entrar e criar conta, do jeito que as telas de acesso usam. Quem monta (o domínio `user`) grava o
 * perfil junto; o `auth` cuida só da sessão (B77).
 */
export interface AccountEntryActions {
  login: (email: string, password: string) => Promise<unknown>;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => Promise<unknown>;
  loginWithGoogle: () => Promise<unknown>;
  forgotPassword: (email: string) => Promise<void>;
}
