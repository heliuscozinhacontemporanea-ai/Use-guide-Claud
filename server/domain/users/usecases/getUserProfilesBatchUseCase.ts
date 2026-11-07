import type { UserProfileDto } from '../dtos/userDto';
import { userService } from '../factory';

export async function getUserProfilesBatchUseCase(
  uids: string[]
): Promise<Record<string, UserProfileDto>> {
  return userService.getProfilesBatch(uids);
}
