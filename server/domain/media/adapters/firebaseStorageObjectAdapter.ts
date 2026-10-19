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

  async savePrivate(path: string, data: Buffer, contentType: string): Promise<void> {
    await adminStorage
      .bucket()
      .file(path)
      .save(data, {
        resumable: false,
        metadata: { contentType, cacheControl: 'private, no-store' },
      });
  }

  async readPrivate(path: string): Promise<{ data: Buffer; contentType: string } | null> {
    const file = adminStorage.bucket().file(path);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [[data], [metadata]] = await Promise.all([file.download(), file.getMetadata()]);
    return { data, contentType: String(metadata.contentType ?? 'application/octet-stream') };
  }

  async delete(path: string): Promise<void> {
    await adminStorage.bucket().file(path).delete({ ignoreNotFound: true });
  }
}
