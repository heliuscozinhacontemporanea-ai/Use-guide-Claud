import { UserProfileDto } from '../dtos/userDto';
import { UpdateUserPreferencesInput, UpdateUserProfileInput } from '../schemas/userSchema';

export interface UserPort {
  getUserProfile(uid: string): Promise<UserProfileDto | null>;
  getUserProfilesBatch(uids: string[]): Promise<Record<string, UserProfileDto>>;
  updateUserProfile(uid: string, data: UpdateUserProfileInput): Promise<UserProfileDto>;
  updateUserPreferences(uid: string, data: UpdateUserPreferencesInput): Promise<void>;
  uploadUserPhoto(uid: string, image: Buffer, contentType: string): Promise<string>;
  upgradeRoleToPartner(uid: string): Promise<void>;
  deleteUserAccount(uid: string): Promise<void>;
  getUsersCount(): Promise<number>;
}
