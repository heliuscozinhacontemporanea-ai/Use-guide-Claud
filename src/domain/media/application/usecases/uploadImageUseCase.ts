import { imageUploadAdapter } from '../../factory';

export async function uploadImageUseCase(file: File, folder?: string): Promise<string> {
  return imageUploadAdapter.uploadImage(file, folder);
}
