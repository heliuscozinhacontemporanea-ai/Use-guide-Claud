import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { VerificationFilePort } from '../ports/verificationFilePort';

// Mesmo limite do servidor (MAX_IMAGE_BYTES); a checagem aqui só evita enviar 6 MB à toa.
const MAX_FILE_BYTES = 6 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('INVALID_DOCUMENT_FILE'));
    reader.onerror = () => reject(new Error('INVALID_DOCUMENT_FILE'));
    reader.readAsDataURL(file);
  });
}

export class ApiVerificationFileAdapter implements VerificationFilePort {
  async uploadVerificationFile(file: File): Promise<{ fileId: string }> {
    if (file.size > MAX_FILE_BYTES) throw new Error('IMAGE_TOO_LARGE');
    // O tipo real é conferido no servidor pelo conteúdo; aqui só barra o que nem é documento.
    if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('INVALID_DOCUMENT_FILE');
    const fileBase64 = await readAsDataUrl(file);
    const response = await firebaseApiFetch(
      '/api/media/verification-files',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64 }),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'UPLOAD_FAILED');
    }
    return { fileId: String(data.fileId) };
  }
}
