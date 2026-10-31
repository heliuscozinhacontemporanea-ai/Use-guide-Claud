import type { Locale } from '../../../shared/i18n';

export type UserRole = 'user' | 'partner';

export interface UserProfile {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string | null;
  phone?: string;
  photoURL?: string | null;
  role?: UserRole;
  /** Idioma escolhido pela pessoa; `null` enquanto ela não escolheu (decisão D10). */
  preferredLocale?: Locale | null;
  /** @usuário (D21); null até a conta escolher. */
  username?: string | null;
  usernameChangedAt?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/** Perfil público achado pelo @, para confirmar quem recebe uma transferência. */
export interface UsernameProfile {
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

export interface ShowPasswordsData {
  current: boolean;
  new: boolean;
  confirm: boolean;
}
