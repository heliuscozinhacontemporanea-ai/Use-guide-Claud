import { AuthenticatedUserContext } from '../security/authenticatedUserContext';
import { getPartnerProfileUseCase } from '../../domain/partners';
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
  let role = snapshot.role;

  // Parceiro suspenso pelo admin perde os poderes de parceiro (itens, eventos) até ser reativado.
  if (role === 'partner') {
    const partner = await getPartnerProfileUseCase(user.uid);
    if (partner?.status === 'suspended') {
      role = 'user';
    }
  }

  return {
    uid: user.uid,
    email: user.email,
    admin: false,
    role,
  };
}
