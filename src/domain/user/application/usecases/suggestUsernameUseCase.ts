import { userAdapter } from '../../factory';

export function suggestUsernameUseCase(name: string): Promise<string> {
  return userAdapter.suggestUsername(name);
}
