import { userAdapter } from '../../factory';
import { UserData, UserProfile } from '../../types/user';
import { updateProfileSchema } from '../../schemas/userSchema';

export async function updateCurrentUserUseCase(data: UserData): Promise<UserProfile> {
  const validatedData = updateProfileSchema.parse(data);
  return userAdapter.updateCurrentUser(validatedData);
}
