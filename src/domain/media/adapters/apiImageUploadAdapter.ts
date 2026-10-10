import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ImageUploadFolder, ImageUploadPort } from '../ports/imageUploadPort';

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('INVALID_IMAGE'));
    reader.onerror = () => reject(new Error('INVALID_IMAGE'));
    reader.readAsDataURL(file);
  });
}

export class ApiImageUploadAdapter implements ImageUploadPort {
  async uploadImage(file: File, folder: ImageUploadFolder): Promise<string> {
    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error('IMAGE_TOO_LARGE');
    }
    const imageBase64 = await readAsDataUrl(file);
    const response = await firebaseApiFetch(
      '/api/media/images',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, folder }),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.code ?? 'UPLOAD_FAILED');
    }
    return data.url as string;
  }
}
