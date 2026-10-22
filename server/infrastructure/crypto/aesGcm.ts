import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const IV_BYTES = 12;
const TAG_BYTES = 16;

export interface AesGcmPayload {
  iv: string;
  tag: string;
  ct: string;
}

/** AES-256-GCM com IV aleatório de 96 bits por operação e tag de 128 bits (AGENTS.md §7.7). */
export function aesGcmEncrypt(key: Buffer, plain: string, aad: string): AesGcmPayload {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: TAG_BYTES });
  cipher.setAAD(Buffer.from(aad, 'utf8'));
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return {
    iv: iv.toString('base64url'),
    tag: cipher.getAuthTag().toString('base64url'),
    ct: ct.toString('base64url'),
  };
}

export function aesGcmDecrypt(key: Buffer, payload: AesGcmPayload, aad: string): string {
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'base64url'), {
    authTagLength: TAG_BYTES,
  });
  decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64url'));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.ct, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}

export function encryptionAad(documentId: string, field: string): string {
  return `${documentId}|${field}`;
}
