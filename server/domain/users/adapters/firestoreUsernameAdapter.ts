import { adminAuth, adminDb } from '../../../infrastructure/firebase/adminClient';
import { UsernameError } from '../errors/usernameError';
import type { UsernameOwner, UsernamePort } from '../ports/usernamePort';

const USERNAMES = 'usernames';
// Dono simbólico do @ de conta excluída: fica reservado até `releasedAt` e depois é liberado.
const DELETED_OWNER = 'deleted';

interface Reservation {
  uid: string;
  releasedAt?: string;
}

function readReservation(data: unknown): Reservation | null {
  const value = data as Partial<Reservation> | undefined;
  return value && typeof value.uid === 'string' ? (value as Reservation) : null;
}

function isFree(reservation: Reservation | null, uid: string, nowIso: string): boolean {
  if (!reservation || reservation.uid === uid) return true;
  return typeof reservation.releasedAt === 'string' && reservation.releasedAt <= nowIso;
}

/** @usuário no Firestore: `usernames/{nome}` garante a unicidade (só o backend escreve, §6.1). */
export class FirestoreUsernameAdapter implements UsernamePort {
  async getCurrent(uid: string): Promise<{ username: string | null; changedAt: string | null }> {
    const data = (await adminDb.collection('users').doc(uid).get()).data() ?? {};
    return {
      username: typeof data.username === 'string' ? data.username : null,
      changedAt: typeof data.usernameChangedAt === 'string' ? data.usernameChangedAt : null,
    };
  }

  async isAvailable(username: string, uid: string, nowIso: string): Promise<boolean> {
    const snap = await adminDb.collection(USERNAMES).doc(username).get();
    return isFree(readReservation(snap.data()), uid, nowIso);
  }

  async claim(uid: string, username: string, nowIso: string, releaseAtIso: string): Promise<void> {
    await adminDb.runTransaction(async (tx) => {
      const userRef = adminDb.collection('users').doc(uid);
      const targetRef = adminDb.collection(USERNAMES).doc(username);
      const [userSnap, targetSnap] = await Promise.all([tx.get(userRef), tx.get(targetRef)]);
      if (!isFree(readReservation(targetSnap.data()), uid, nowIso)) {
        throw new UsernameError('USERNAME_TAKEN', 'Este nome de usuário já está em uso.');
      }
      const previous = userSnap.data()?.username;
      if (typeof previous === 'string' && previous !== username) {
        // O @ anterior fica com a conta por 14 dias, para ninguém se passar por ela logo depois.
        tx.set(adminDb.collection(USERNAMES).doc(previous), { uid, releasedAt: releaseAtIso });
      }
      tx.set(targetRef, { uid, createdAt: nowIso });
      tx.set(userRef, { username, usernameChangedAt: nowIso, updatedAt: nowIso }, { merge: true });
      tx.set(
        adminDb.collection('publicProfiles').doc(uid),
        { uid, username, updatedAt: nowIso },
        { merge: true }
      );
    });
  }

  async findOwner(username: string): Promise<UsernameOwner | null> {
    const reservation = readReservation(
      (await adminDb.collection(USERNAMES).doc(username).get()).data()
    );
    if (!reservation || reservation.releasedAt || reservation.uid === DELETED_OWNER) return null;
    const [profileSnap, authUser] = await Promise.all([
      adminDb.collection('publicProfiles').doc(reservation.uid).get(),
      adminAuth.getUser(reservation.uid).catch(() => null),
    ]);
    if (!authUser) return null;
    const profile = profileSnap.data() ?? {};
    return {
      uid: reservation.uid,
      username,
      displayName: typeof profile.displayName === 'string' ? profile.displayName : null,
      photoURL: typeof profile.photoURL === 'string' ? profile.photoURL : null,
      email: authUser.email ?? '',
      emailVerified: authUser.emailVerified,
    };
  }

  async releaseAll(uid: string, releaseAtIso: string): Promise<void> {
    const snap = await adminDb.collection(USERNAMES).where('uid', '==', uid).get();
    const batch = adminDb.batch();
    for (const doc of snap.docs) {
      batch.set(doc.ref, { uid: DELETED_OWNER, releasedAt: releaseAtIso });
    }
    if (!snap.empty) await batch.commit();
  }
}
