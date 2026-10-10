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
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
