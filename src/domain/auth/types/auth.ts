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

export interface AuthState {
  user: UserSession | null;
  loading: boolean;
  error: string | null;
}
