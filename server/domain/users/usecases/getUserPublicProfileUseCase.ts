import { userService } from '../factory';
import { PublicUserProfileDto, toPublicUserProfileDto } from '../dtos/userDto';

export async function getUserPublicProfileUseCase(
  uid: string
): Promise<PublicUserProfileDto | null> {
  if (!uid) return null;
  const profile = await userService.getProfile(uid);
  if (!profile) return null;
  return toPublicUserProfileDto(profile, uid);
}
