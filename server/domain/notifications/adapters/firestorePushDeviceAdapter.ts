import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../../infrastructure/firebase/adminClient';
import type { PushDevice, PushDevicePort } from '../ports/pushPorts';

const DEVICES = 'pushDevices';

/** O id é o hash do token: o mesmo aparelho não vira duas linhas e o token não aparece em caminhos. */
function deviceId(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export class FirestorePushDeviceAdapter implements PushDevicePort {
  async register(uid: string, token: string, locale: string): Promise<void> {
    await adminDb.collection(DEVICES).doc(deviceId(token)).set({
      uid,
      token,
      locale,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  async unregister(uid: string, token: string): Promise<void> {
    const ref = adminDb.collection(DEVICES).doc(deviceId(token));
    const snap = await ref.get();
    // Só a própria conta tira o aparelho; token de outra pessoa é ignorado sem revelar nada.
    if (snap.exists && snap.get('uid') === uid) await ref.delete();
  }

  async listForUser(uid: string): Promise<PushDevice[]> {
    const snap = await adminDb.collection(DEVICES).where('uid', '==', uid).get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      token: String(doc.get('token') ?? ''),
      locale: String(doc.get('locale') ?? ''),
    }));
  }

  async remove(deviceIds: string[]): Promise<void> {
    const writer = adminDb.bulkWriter();
    for (const id of deviceIds) writer.delete(adminDb.collection(DEVICES).doc(id));
    await writer.close();
  }

  async deleteAllForUser(uid: string): Promise<void> {
    const snap = await adminDb.collection(DEVICES).where('uid', '==', uid).get();
    const writer = adminDb.bulkWriter();
    for (const doc of snap.docs) writer.delete(doc.ref);
    await writer.close();
  }
}
