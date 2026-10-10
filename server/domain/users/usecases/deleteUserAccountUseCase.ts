import { userService } from '../factory';

export async function deleteUserAccountUseCase(uid: string): Promise<void> {
  await userService.deleteAccount(uid);
}
