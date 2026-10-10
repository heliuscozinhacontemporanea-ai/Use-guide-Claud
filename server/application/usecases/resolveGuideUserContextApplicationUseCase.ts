import { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { getUserAuthorizationSnapshotUseCase } from '../../domain/users';

export async function resolveGuideUserContextApplicationUseCase(user: {
  uid: string;
  email?: string;
  admin?: boolean;
}): Promise<AuthenticatedUserContext> {
  if (user.admin === true) {
    return {
      uid: user.uid,
      email: user.email,
      admin: true,
      role: 'admin',
    };
  }

  const snapshot = await getUserAuthorizationSnapshotUseCase(user.uid);
  return {
    uid: user.uid,
    email: user.email,
    admin: false,
    role: snapshot.role,
  };
}
