import { getMediaService } from '../factory';
import type { StoredObject } from '../ports/objectStoragePort';
import type { ContentImageFolder } from '../types/mediaTypes';

export async function uploadContentImageUseCase(params: {
  uid: string;
  folder: ContentImageFolder;
  imageBase64: string;
}): Promise<StoredObject> {
  return getMediaService().uploadContentImage(params);
}
