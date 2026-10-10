import { FirebaseStorageObjectAdapter } from './adapters/firebaseStorageObjectAdapter';
import { SharpImageProcessorAdapter } from './adapters/sharpImageProcessorAdapter';
import { MediaService } from './services/mediaService';

let mediaService: MediaService | undefined;

export function getMediaService(): MediaService {
  mediaService ??= new MediaService(
    new SharpImageProcessorAdapter(),
    new FirebaseStorageObjectAdapter()
  );
  return mediaService;
}
