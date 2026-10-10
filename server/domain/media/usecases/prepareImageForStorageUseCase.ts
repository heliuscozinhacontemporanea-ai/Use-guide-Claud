import { getMediaService } from '../factory';
import type { ProcessedImage } from '../ports/imageProcessorPort';

export async function prepareImageForStorageUseCase(
  imageBase64: string,
  maxDimension: number
): Promise<ProcessedImage> {
  const service = getMediaService();
  return service.processImage(service.decodeBase64Image(imageBase64), maxDimension);
}
