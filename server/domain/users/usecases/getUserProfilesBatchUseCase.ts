import { userService } from '../factory';
import type { UserProfileDto } from '../dtos/userDto';

export async function getUserProfilesBatchUseCase(
  uids: string[]
): Promise<Record<string, UserProfileDto>> {
  return userService.getProfilesBatch(uids);
}
