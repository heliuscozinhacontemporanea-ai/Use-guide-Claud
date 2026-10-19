import type { Locale } from '../../../shared/i18n';
import { UserProfile, UserData } from '../types/user';

export interface UserPort {
  getCurrentUser(): Promise<UserProfile | null>;
  updateCurrentUser(data: UserData): Promise<UserProfile>;
  updatePreferredLocale(locale: Locale): Promise<void>;
  deleteCurrentUser(): Promise<void>;
}
