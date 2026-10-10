import { userService } from '../factory';

export interface UserAuthorizationSnapshot {
  role: 'user' | 'partner';
}

export async function getUserAuthorizationSnapshotUseCase(
  uid: string
): Promise<UserAuthorizationSnapshot> {
  const profile = await userService.getProfile(uid);
  return {
    role: profile?.role === 'partner' ? 'partner' : 'user',
  };
}
