import { UserProfileDto } from '../dtos/userDto';
import { UpdateUserProfileInput } from '../schemas/userSchema';

export interface UserPort {
  getUserProfile(uid: string): Promise<UserProfileDto | null>;
  getUserProfilesBatch(uids: string[]): Promise<Record<string, UserProfileDto>>;
  updateUserProfile(uid: string, data: UpdateUserProfileInput): Promise<UserProfileDto>;
  uploadUserPhoto(uid: string, photoBase64: string, mimeType: string): Promise<string>;
  upgradeRoleToPartner(uid: string): Promise<void>;
  deleteUserAccount(uid: string): Promise<void>;
  getUsersCount(): Promise<number>;
}
