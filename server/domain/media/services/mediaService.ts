import { randomUUID } from 'crypto';
import { MediaDomainError } from '../errors/mediaDomainError';
import type { ImageProcessorPort, ProcessedImage } from '../ports/imageProcessorPort';
import type { ObjectStoragePort, StoredObject } from '../ports/objectStoragePort';
import { MAX_IMAGE_BYTES, type ContentImageFolder } from '../types/mediaTypes';
import { detectImageType } from '../utils/detectImageType';

export class MediaService {
  constructor(
    private readonly processor: ImageProcessorPort,
    private readonly storage: ObjectStoragePort
  ) {}

  decodeBase64Image(imageBase64: string): Buffer {
    const clean = imageBase64.replace(/^data:image\/[a-z+.-]+;base64,/i, '');
    const buffer = Buffer.from(clean, 'base64');
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new MediaDomainError('IMAGE_TOO_LARGE', 'Imagem acima de 6 MB.', 413);
    }
    if (!detectImageType(buffer)) {
      throw new MediaDomainError('INVALID_IMAGE', 'Envie uma imagem JPEG, PNG ou WebP.', 400);
    }
    return buffer;
  }

  async processImage(buffer: Buffer, maxDimension: number): Promise<ProcessedImage> {
    try {
      return await this.processor.process(buffer, { maxDimension });
    } catch {
      throw new MediaDomainError('INVALID_IMAGE', 'Não foi possível ler a imagem.', 400);
    }
  }

  async uploadContentImage(params: {
    uid: string;
    folder: ContentImageFolder;
    imageBase64: string;
  }): Promise<StoredObject> {
    const processed = await this.processImage(this.decodeBase64Image(params.imageBase64), 2048);
    const path = `content/${params.folder}/${params.uid}/${randomUUID()}.webp`;
    try {
      return await this.storage.savePublic(path, processed.buffer, processed.contentType);
    } catch {
      throw new MediaDomainError('STORAGE_UNAVAILABLE', 'Falha ao salvar a imagem.', 503);
    }
  }
}
