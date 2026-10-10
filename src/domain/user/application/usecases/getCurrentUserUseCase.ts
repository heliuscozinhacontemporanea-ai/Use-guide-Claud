import { userAdapter } from '../../factory';
import { UserProfile } from '../../types/user';

export async function getCurrentUserUseCase(): Promise<UserProfile | null> {
  return userAdapter.getCurrentUser();
}
