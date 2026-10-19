import { UserPort } from '../ports/userPort';
import { UserProfileDto, toUserProfileDto } from '../dtos/userDto';
import { UpdateUserPreferencesInput, UpdateUserProfileInput } from '../schemas/userSchema';
import { adminDb, adminAuth, adminStorage } from '../../../infrastructure/firebase/adminClient';
import { FieldValue } from 'firebase-admin/firestore';

export class FirestoreUserAdapter implements UserPort {
  async getUserProfile(uid: string): Promise<UserProfileDto | null> {
    const docSnap = await adminDb.collection('users').doc(uid).get();
    if (!docSnap.exists) return null;
    return toUserProfileDto(docSnap.data(), uid);
  }

  async getUserProfilesBatch(uids: string[]): Promise<Record<string, UserProfileDto>> {
    const uniqueUids = Array.from(new Set(uids.filter(Boolean)));
    if (uniqueUids.length === 0) {
      return {};
    }

    const refs = uniqueUids.map((uid) => adminDb.collection('users').doc(uid));
    const snapshots = await adminDb.getAll(...refs);
    const profiles: Record<string, UserProfileDto> = {};

    for (const snap of snapshots) {
      if (snap.exists) {
        profiles[snap.id] = toUserProfileDto(snap.data(), snap.id);
      }
    }

    return profiles;
  }

  async updateUserProfile(uid: string, data: UpdateUserProfileInput): Promise<UserProfileDto> {
    const userRef = adminDb.collection('users').doc(uid);
    const displayName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || null;

    const updatePayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      displayName,
      phone: data.phone,
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(updatePayload, { merge: true });
    const updatedSnap = await userRef.get();

    const publicRef = adminDb.collection('publicProfiles').doc(uid);
    await publicRef.set(
      {
        uid,
        displayName,
        photoURL: updatedSnap.data()?.photoURL || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return toUserProfileDto(updatedSnap.data(), uid);
  }

  async updateUserPreferences(uid: string, data: UpdateUserPreferencesInput): Promise<void> {
    await adminDb
      .collection('users')
      .doc(uid)
      .set(
        { preferredLocale: data.preferredLocale, updatedAt: new Date().toISOString() },
        { merge: true }
      );
  }

  async uploadUserPhoto(uid: string, image: Buffer, contentType: string): Promise<string> {
    const bucket = adminStorage.bucket();
    const file = bucket.file(`profiles/${uid}`);

    await file.save(image, {
      metadata: {
        contentType,
      },
      public: true,
    });

    // O caminho é fixo por usuário; o parâmetro v evita que navegador e CDN mostrem a foto anterior.
    const photoURL = `https://storage.googleapis.com/${bucket.name}/profiles/${uid}?v=${Date.now()}`;

    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({ photoURL, updatedAt: new Date().toISOString() }, { merge: true });

    const publicRef = adminDb.collection('publicProfiles').doc(uid);
    await publicRef.set({ photoURL, updatedAt: new Date().toISOString() }, { merge: true });

    await adminAuth.updateUser(uid, {
      photoURL,
    });

    return photoURL;
  }

  async deleteUserAccount(uid: string): Promise<void> {
    try {
      const bucket = adminStorage.bucket();
      await bucket.file(`profiles/${uid}`).delete({
        ignoreNotFound: true,
      });
    } catch (error) {
      console.error(
        '[FirestoreUserAdapter.deleteUserAccount] Falha ao remover foto do Storage:',
        error
      );
      throw error;
    }

    const publicRef = adminDb.collection('publicProfiles').doc(uid);
    await publicRef.delete();

    const userRef = adminDb.collection('users').doc(uid);
    await userRef.delete();

    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      // Exclusão idempotente: a conta pode já ter saído do Firebase Auth numa tentativa anterior.
      if ((error as { code?: unknown } | null)?.code !== 'auth/user-not-found') {
        throw error;
      }
    }
  }

  async upgradeRoleToPartner(uid: string): Promise<void> {
    const userRef = adminDb.collection('users').doc(uid);

    await userRef.update({
      role: 'partner',
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async getUsersCount(): Promise<number> {
    const snapshot = await adminDb.collection('users').count().get();
    return snapshot.data().count;
  }
}
