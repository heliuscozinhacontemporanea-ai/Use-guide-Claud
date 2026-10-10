import { profileMediaAdapter } from '../../factory';

export async function uploadProfilePhotoUseCase(
  userId: string,
  imageBlob: Blob
): Promise<string> {
  return profileMediaAdapter.uploadProfilePhoto(userId, imageBlob);
}
