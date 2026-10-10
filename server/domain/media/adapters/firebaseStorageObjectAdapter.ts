import { randomUUID } from 'crypto';
import { adminStorage } from '../../../infrastructure/firebase/adminClient';
import type { ObjectStoragePort, StoredObject } from '../ports/objectStoragePort';

export class FirebaseStorageObjectAdapter implements ObjectStoragePort {
  async savePublic(path: string, data: Buffer, contentType: string): Promise<StoredObject> {
    const bucket = adminStorage.bucket();
    const downloadToken = randomUUID();
    await bucket.file(path).save(data, {
      resumable: false,
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: { firebaseStorageDownloadTokens: downloadToken },
      },
    });
    // Referência: formato de URL de download do Firebase Storage com token.
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;
    return { path, url };
  }

  async delete(path: string): Promise<void> {
    await adminStorage.bucket().file(path).delete({ ignoreNotFound: true });
  }
}
