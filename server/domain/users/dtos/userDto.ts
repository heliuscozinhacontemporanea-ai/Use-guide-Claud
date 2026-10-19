import { type Locale, SUPPORTED_LOCALES } from '../../../shared/kernel/locale';
import { UserRole } from '../types/userTypes';

export interface PrivateUserProfileDto {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  photoURL?: string;
  role: UserRole;
  preferredLocale: Locale | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UserProfileDto = PrivateUserProfileDto;

export interface PublicUserProfileDto {
  uid: string;
  displayName: string | null;
  photoURL?: string | null;
}

export function toPrivateUserProfileDto(raw: unknown, uid: string): PrivateUserProfileDto {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const rawRole = typeof data.role === 'string' ? data.role : 'user';
  const role: UserRole = rawRole === 'partner' ? 'partner' : 'user';

  return {
    uid,
    email: typeof data.email === 'string' ? data.email : '',
    firstName: typeof data.firstName === 'string' ? data.firstName : '',
    lastName: typeof data.lastName === 'string' ? data.lastName : '',
    phone: typeof data.phone === 'string' ? data.phone : '',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : '',
    role,
    preferredLocale: SUPPORTED_LOCALES.find((locale) => locale === data.preferredLocale) ?? null,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : '',
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
  };
}

export const toUserProfileDto = toPrivateUserProfileDto;

export function toPublicUserProfileDto(raw: unknown, uid: string): PublicUserProfileDto {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const firstName = typeof data.firstName === 'string' ? data.firstName : '';
  const lastName = typeof data.lastName === 'string' ? data.lastName : '';
  const derivedDisplayName = `${firstName} ${lastName}`.trim() || null;
  const displayName =
    typeof data.displayName === 'string' && data.displayName.trim()
      ? data.displayName
      : derivedDisplayName;

  return {
    uid,
    displayName,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
  };
}
