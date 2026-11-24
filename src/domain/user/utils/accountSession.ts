import { UserRole, type UserSession } from '../../auth';
import type { UserProfile } from '../types/user';

/** Foto que o app mostra: a enviada agora, a do perfil ou a da conta Google, nessa ordem. */
export function accountPhoto(
  session: UserSession | null,
  profile: UserProfile | null,
  uploaded: string | null
): string | null {
  if (!session) return null;
  return uploaded || profile?.photoURL || session.photoURL || null;
}

/**
 * A sessão como o app usa: admin vem das claims do token; parceiro vem do perfil no Firestore, que só
 * o servidor muda.
 */
export function accountUser(
  session: UserSession | null,
  profile: UserProfile | null,
  photoURL: string | null
): UserSession | null {
  if (!session) return null;
  const role =
    session.role === UserRole.ADMIN
      ? UserRole.ADMIN
      : profile?.role === 'partner'
        ? UserRole.PARTNER
        : UserRole.USER;
  return { ...session, photoURL, role };
}
