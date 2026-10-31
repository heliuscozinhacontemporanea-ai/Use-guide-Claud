import type { Locale } from '../../../shared/i18n';
import { UserProfile, UserData, UsernameProfile } from '../types/user';

export interface UserPort {
  getCurrentUser(): Promise<UserProfile | null>;
  updateCurrentUser(data: UserData): Promise<UserProfile>;
  updatePreferredLocale(locale: Locale): Promise<void>;
  deleteCurrentUser(): Promise<void>;
  suggestUsername(name: string): Promise<string>;
  claimUsername(username: string): Promise<string>;
  findByUsername(username: string): Promise<UsernameProfile>;
}
