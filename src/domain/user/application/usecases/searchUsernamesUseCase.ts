import { userAdapter } from '../../factory';

export function searchUsernamesUseCase(prefix: string) {
  return userAdapter.searchUsernames(prefix);
}
