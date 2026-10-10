import { userService } from '../factory';

export async function getUserProfileUseCase(uid: string) {
  if (!uid || !uid.trim()) {
    return null;
  }
  return userService.getProfile(uid);
}
