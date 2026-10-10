import { imageUploadAdapter } from '../../factory';
import type { ImageUploadFolder } from '../../ports/imageUploadPort';

export async function uploadImageUseCase(file: File, folder: ImageUploadFolder): Promise<string> {
  return imageUploadAdapter.uploadImage(file, folder);
}
