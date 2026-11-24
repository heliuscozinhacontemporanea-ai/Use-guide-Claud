import { UserProfileDto } from '../dtos/userDto';
import type { TermsAcceptance } from '../../../shared/kernel/legalTerms';
import { UpdateUserPreferencesInput } from '../schemas/userSchema';

/** O que o perfil grava; o aceite dos Termos de uso vem do servidor (D35 1b). */
export interface UserProfileUpdate {
  firstName: string;
  lastName: string;
  phone: string;
  useTerms?: TermsAcceptance;
}

export interface UserPort {
  getUserProfile(uid: string): Promise<UserProfileDto | null>;
  getUserProfilesBatch(uids: string[]): Promise<Record<string, UserProfileDto>>;
  updateUserProfile(uid: string, data: UserProfileUpdate): Promise<UserProfileDto>;
  updateUserPreferences(uid: string, data: UpdateUserPreferencesInput): Promise<void>;
  uploadUserPhoto(uid: string, image: Buffer, contentType: string): Promise<string>;
  upgradeRoleToPartner(uid: string): Promise<void>;
  deleteUserAccount(uid: string): Promise<void>;
  getUsersCount(): Promise<number>;
  /** IDs de contas em ordem, para avisos a todos (ex.: termos mudaram). */
  listUserIdsPage(
    cursor: string | null,
    limit: number
  ): Promise<{ ids: string[]; nextCursor: string | null }>;
}
