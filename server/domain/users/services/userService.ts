import { UserPort } from '../ports/userPort';
import { UserProfileDto } from '../dtos/userDto';
import { UpdateUserProfileInput } from '../schemas/userSchema';

export class UserService {
  constructor(private userPort: UserPort) {}

  async getProfile(uid: string): Promise<UserProfileDto | null> {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório');
    }
    return this.userPort.getUserProfile(uid);
  }

  async getProfilesBatch(uids: string[]): Promise<Record<string, UserProfileDto>> {
    if (!Array.isArray(uids) || uids.length === 0) {
      return {};
    }
    return this.userPort.getUserProfilesBatch(uids);
  }

  async updateProfile(uid: string, input: UpdateUserProfileInput): Promise<UserProfileDto> {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório');
    }
    return this.userPort.updateUserProfile(uid, input);
  }

  async uploadPhoto(uid: string, photoBase64: string, mimeType: string): Promise<string> {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório');
    }
    return this.userPort.uploadUserPhoto(uid, photoBase64, mimeType);
  }

  async deleteAccount(uid: string): Promise<void> {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório para exclusão');
    }
    await this.userPort.deleteUserAccount(uid);
  }

  async upgradeRoleToPartner(uid: string): Promise<void> {
    if (!uid) {
      throw new Error('UID do usuário é obrigatório');
    }
    await this.userPort.upgradeRoleToPartner(uid);
  }

  async getUsersCount(): Promise<number> {
    return this.userPort.getUsersCount();
  }
}
