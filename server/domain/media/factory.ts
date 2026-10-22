import { FirebaseStorageObjectAdapter } from './adapters/firebaseStorageObjectAdapter';
import { SharpImageProcessorAdapter } from './adapters/sharpImageProcessorAdapter';
import { MediaService } from './services/mediaService';
import { PrivateDocumentService } from './services/privateDocumentService';

let mediaService: MediaService | undefined;
let privateDocumentService: PrivateDocumentService | undefined;

export function getMediaService(): MediaService {
  mediaService ??= new MediaService(
    new SharpImageProcessorAdapter(),
    new FirebaseStorageObjectAdapter()
  );
  return mediaService;
}

export function getPrivateDocumentService(): PrivateDocumentService {
  privateDocumentService ??= new PrivateDocumentService(
    new SharpImageProcessorAdapter(),
    new FirebaseStorageObjectAdapter()
  );
  return privateDocumentService;
}
