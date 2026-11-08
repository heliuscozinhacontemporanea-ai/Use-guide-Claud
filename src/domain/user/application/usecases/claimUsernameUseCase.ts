import { userAdapter } from '../../factory';

export function claimUsernameUseCase(username: string): Promise<string> {
  return userAdapter.claimUsername(username);
}
