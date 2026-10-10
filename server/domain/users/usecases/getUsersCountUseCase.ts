import { userService } from '../factory';

export async function getUsersCountUseCase(): Promise<number> {
  return userService.getUsersCount();
}
